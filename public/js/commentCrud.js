document.addEventListener('DOMContentLoaded', function () {
    const commentsTableBody = document.querySelector('#commentsTable tbody');

    // Fetch and display all comments
    function fetchComments() {
        fetch('/customer/getComments')
            .then(response => response.json())
            .then(comments => {
                commentsTableBody.innerHTML = ''; // Clear table

                comments.forEach(comment => {
                    const row = document.createElement('tr');
                    row.dataset.id = comment._id;  // Store the comment ID in the row

                    row.innerHTML = `
                        <td class="coName">${comment.coName}</td>
                        <td class="coEmail">${comment.coEmail}</td>
                        <td class="coPhone">${comment.coPhone}</td>
                        <td class="coMessage">${comment.coMessage}</td>
                        <td>${new Date(comment.createdAt).toLocaleDateString()}</td>
                        <td>
                            <label class="switch">
                                <input type="checkbox" class="visibility-toggle" data-id="${comment._id}" ${comment.isVisible ? 'checked' : ''}>
                                <span class="slider round"></span>
                            </label>
                        </td>
                        <td>
                            <i class="fa fa-2x fa-edit edit-icon" data-id="${comment._id}" title="Edit"></i>
                            <i class="fa fa-2x fa-trash delete-icon" data-id="${comment._id}" title="Delete"></i>
                            <i class="fa fa-2x fa-undo recover-icon" data-id="${comment._id}" style="display: ${comment.deleted ? 'inline' : 'none'};" title="Recover"></i>
                        </td>
                    `;

                    // Attach event listener for visibility toggle
                    const visibilityToggle = row.querySelector('.visibility-toggle');
                    visibilityToggle.addEventListener('change', handleVisibilityToggle);

                    commentsTableBody.appendChild(row);
                });

                attachEventListeners();
            })
            .catch(error => console.error('Error fetching comments:', error));
    }

    // Handle visibility toggle changes
    function handleVisibilityToggle(event) {
        const id = event.target.dataset.id;
        const isVisible = event.target.checked;

        fetch(`/customer/toggleVisibility/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isVisible: isVisible }),
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                fetchComments();
            })
            .catch(error => console.error('Error toggling visibility:', error));
    }

    // Attach event listeners for action icons
    function attachEventListeners() {
        document.querySelectorAll('.edit-icon').forEach(icon => {
            icon.addEventListener('click', editComment);
        });

        document.querySelectorAll('.delete-icon').forEach(icon => {
            icon.addEventListener('click', deleteComment);
        });

        document.querySelectorAll('.recover-icon').forEach(icon => {
            icon.addEventListener('click', recoverComment);
        });
    }

// Edit comment function
function editComment(event) {
    const row = event.target.closest('tr');
    const id = row.dataset.id;

    // Get existing values
    const name = row.querySelector('.coName').textContent;
    const email = row.querySelector('.coEmail').textContent;
    const phone = row.querySelector('.coPhone').textContent;
    const message = row.querySelector('.coMessage').textContent;

    // Transform the row into editable inputs with Font Awesome icons
    row.innerHTML = `
        <td><input type="text" class="edit-coName" value="${name}"></td>
        <td><input type="email" class="edit-coEmail" value="${email}"></td>
        <td><input type="text" class="edit-coPhone" value="${phone}"></td>
        <td><textarea class="edit-coMessage">${message}</textarea></td>
        <td>
        <td></td>
        <td>
            <i class="fa fa-2x fa-save save-icon" data-id="${id}" title="Save"></i>
            <i class="fa fa-2x fa-times cancel-icon" title="Cancel"></i>       
        </td>
        </td>
    `;

    // Attach event listeners to the new icons
    row.querySelector('.save-icon').addEventListener('click', saveComment);
    row.querySelector('.cancel-icon').addEventListener('click', cancelEdit);
}

    // Save comment function
    function saveComment(event) {
        const row = event.target.closest('tr');
        const id = row.dataset.id;

        const name = row.querySelector('.edit-coName').value;
        const email = row.querySelector('.edit-coEmail').value;
        const phone = row.querySelector('.edit-coPhone').value;
        const message = row.querySelector('.edit-coMessage').value;

        // Validate input
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        if (!isValidPhone(phone)) {
            alert('Please enter a valid 8-digit phone number.');
            return;
        }

        // Send updated data to the server
        fetch(`/customer/updateComment/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                coName: name,
                coEmail: email,
                coPhone: phone,
                coMessage: message
            }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                fetchComments(); // Refresh table
                alert(data.message); // Show success message
            })
            .catch(error => console.error('Error updating comment:', error));
    }

    // Cancel edit function
    function cancelEdit(event) {
        fetchComments(); // Reload comments to reset the row
    }

    // Delete comment function
    function deleteComment(event) {
        const row = event.target.closest('tr');
        const id = row.dataset.id;

        fetch(`/customer/deleteComment/${id}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                fetchComments(); // Refresh table
                alert(data.message); // Show success message
            })
            .catch(error => console.error('Error deleting comment:', error));
    }

    // Recover comment function
    function recoverComment(event) {
        const row = event.target.closest('tr');
        const id = row.dataset.id;

        fetch(`/customer/recoverComment/${id}`, {
            method: 'POST',
        })
            .then(response => response.json())
            .then(data => {
                fetchComments(); // Refresh table
                alert(data.message); // Show success message
            })
            .catch(error => console.error('Error recovering comment:', error));
    }

    // Email validation function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone validation function
    function isValidPhone(phone) {
        const phoneRegex = /^[0-9]{8}$/;  // 8-digit phone number regex
        return phoneRegex.test(phone);
    }

    // Initial fetch of comments
    fetchComments();
});