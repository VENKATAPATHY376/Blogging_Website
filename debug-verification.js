// Quick verification script - paste this in browser console when viewing a post

// Check if user is logged in
const user = JSON.parse(localStorage.getItem('me') || 'null');
console.log('Current User:', user);

// Check if we're on a post page
const hash = location.hash;
console.log('Current page:', hash);

// If on post page, check author comparison
if (hash.startsWith('#/post/')) {
  // Check if edit/delete buttons exist
  const editBtn = document.querySelector('#editBtn');
  const deleteBtn = document.querySelector('#deleteBtn');
  
  console.log('Edit button exists:', !!editBtn);
  console.log('Delete button exists:', !!deleteBtn);
  
  if (editBtn) {
    console.log('Edit button HTML:', editBtn.outerHTML);
  }
  
  if (deleteBtn) {
    console.log('Delete button HTML:', deleteBtn.outerHTML);
  }
  
  // Manual check - create test buttons
  const testDiv = document.createElement('div');
  testDiv.innerHTML = `
    <div style="position: fixed; top: 10px; right: 10px; background: white; padding: 10px; border: 2px solid red; z-index: 9999;">
      <h4>Test Icons</h4>
      <button class="btn btn-outline-primary btn-sm">
        <i class="bi bi-pencil"></i> Edit
      </button>
      <button class="btn btn-outline-danger btn-sm">
        <i class="bi bi-trash"></i> Delete
      </button>
      <br>
      <small>If you see pencil and trash icons above, Bootstrap Icons are working</small>
      <br>
      <button onclick="this.parentElement.parentElement.remove()">Close</button>
    </div>
  `;
  document.body.appendChild(testDiv);
}