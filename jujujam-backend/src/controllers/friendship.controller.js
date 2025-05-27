// jujujam-backend/src/controllers/friendship.controller.js
const User = require('../models/Users');
const Friendship = require('../models/Friendships');

// @desc    Send a friend request
// @route   POST /api/friends/request
// @access  Private
exports.sendFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const requesterId = req.user.id;

    // Check if trying to send request to self
    if (requesterId === recipientId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a friend request to yourself'
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if friendship already exists
    const existingFriendship = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'You are already friends with this user'
        });
      } else if (existingFriendship.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Friend request already sent or received'
        });
      } else if (existingFriendship.status === 'blocked') {
        return res.status(400).json({
          success: false,
          message: 'Cannot send friend request to this user'
        });
      }
    }

    // Create new friend request
    const friendship = new Friendship({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending'
    });

    await friendship.save();
    await friendship.populate('recipient', 'username displayName profilePicture');

    res.status(201).json({
      success: true,
      message: 'Friend request sent successfully',
      friendship
    });

  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending friend request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Accept a friend request
// @route   PUT /api/friends/accept/:friendshipId
// @access  Private
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const userId = req.user.id;

    // Find the friendship
    const friendship = await Friendship.findById(friendshipId);
    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    // Check if user is the recipient of the request
    if (friendship.recipient.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only accept friend requests sent to you'
      });
    }

    // Check if request is still pending
    if (friendship.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This friend request has already been processed'
      });
    }

    // Accept the friend request
    friendship.status = 'accepted';
    friendship.updatedAt = new Date();
    await friendship.save();

    await friendship.populate('requester recipient', 'username displayName profilePicture');

    res.status(200).json({
      success: true,
      message: 'Friend request accepted',
      friendship
    });

  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting friend request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Reject a friend request
// @route   PUT /api/friends/reject/:friendshipId
// @access  Private
// @desc    Reject a friend request
// @route   PUT /api/friends/reject/:friendshipId
// @access  Private
exports.rejectFriendRequest = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const userId = req.user.id;

    // Find the friendship
    const friendship = await Friendship.findById(friendshipId);
    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    // Check if user is the recipient of the request
    if (friendship.recipient.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only reject friend requests sent to you'
      });
    }

    // Check if request is still pending
    if (friendship.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This friend request has already been processed'
      });
    }

    // DELETE the friendship record instead of just marking as rejected
    await Friendship.findByIdAndDelete(friendshipId);
    console.log("Friendship record deleted after rejection");

    res.status(200).json({
      success: true,
      message: 'Friend request rejected and removed'
    });

  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting friend request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user's friends list
// @route   GET /api/friends
// @access  Private
exports.getFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    const friends = await user.getFriends();

    res.status(200).json({
      success: true,
      count: friends.length,
      friends
    });

  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving friends list',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get incoming friend requests
// @route   GET /api/friends/requests/incoming
// @access  Private
exports.getIncomingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    const requests = await user.getFriendRequests();

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (error) {
    console.error('Get incoming requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving friend requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get outgoing friend requests
// @route   GET /api/friends/requests/outgoing
// @access  Private
exports.getOutgoingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    const requests = await user.getPendingRequests();

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (error) {
    console.error('Get outgoing requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving sent requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Remove a friend
// @route   DELETE /api/friends/:friendId
// @access  Private
exports.removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;

    // Find the friendship
    const friendship = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: friendId },
        { requester: friendId, recipient: userId }
      ],
      status: 'accepted'
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Friendship not found'
      });
    }

    // Remove the friendship
    await Friendship.findByIdAndDelete(friendship._id);

    res.status(200).json({
      success: true,
      message: 'Friend removed successfully'
    });

  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing friend',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Search users (for discovering new friends)
// @route   GET /api/friends/discover
// @access  Private
exports.discoverUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    // Build search query
    let searchQuery = { _id: { $ne: userId } }; // Exclude current user

    if (search) {
      searchQuery.$or = [
        { username: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get users with pagination
    const users = await User.find(searchQuery)
      .select('username displayName profilePicture bio')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Get current user's friendships to determine relationship status
    const friendships = await Friendship.find({
      $or: [
        { requester: userId },
        { recipient: userId }
      ]
    });

    // Add relationship status to each user
    const usersWithStatus = users.map(user => {
      const friendship = friendships.find(f => 
        f.requester.toString() === user._id.toString() || 
        f.recipient.toString() === user._id.toString()
      );

      let relationshipStatus = 'none';
      if (friendship) {
        if (friendship.status === 'accepted') {
          relationshipStatus = 'friends';
        } else if (friendship.status === 'pending') {
          relationshipStatus = friendship.requester.toString() === userId ? 'requested' : 'pending';
        }
      }

      return {
        ...user.toObject(),
        relationshipStatus
      };
    });

    res.status(200).json({
      success: true,
      users: usersWithStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: users.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Discover users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error discovering users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};