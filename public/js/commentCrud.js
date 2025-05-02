document.addEventListener('DOMContentLoaded', function () {
    const commentsTableBody = document.querySelector('#commentsTable tbody');
    const addCommentForm = document.getElementById('addCommentForm');

    // Function to fetch and display all comments
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
                            <i class="fas fa-edit edit-icon" data-id="${comment._id}"></i>
                            <i class="fas fa-trash delete-icon" data-id="${comment._id}"></i>
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

    // Function to handle visibility toggle changes
    function handleVisibilityToggle(event) {
        const id = event.target.dataset.id;
        const isVisible = event.target.checked;

        fetch(`/customer/toggleVisibility/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                isVisible: isVisible
            }),
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message); // Show success message
                fetchComments(); // Refresh table
            })
            .catch(error => console.error('Error toggling visibility:', error));
    }

    // Function to attach event listeners to the edit and delete icons
    function attachEventListeners() {
        document.querySelectorAll('.edit-icon').forEach(icon => {
            icon.addEventListener('click', editComment);
        });

        document.querySelectorAll('.delete-icon').forEach(icon => {
            icon.addEventListener('click', deleteComment);
        });
    }

    // Edit comment function
    function editComment(event) {
        const row = event.target.closest('tr');
        const id = row.dataset.id;
        const createdAt = row.querySelector('td:nth-child(5)').textContent; // Store the date text
        const visibility = row.querySelector('td:nth-child(6)').innerHTML;  // Store the visibility HTML

        // Get the existing values from the table cells
        const name = row.querySelector('.coName').textContent;
        const email = row.querySelector('.coEmail').textContent;
        const phone = row.querySelector('.coPhone').textContent;
        const message = row.querySelector('.coMessage').textContent;

        // Transform the row into editable inputs
        row.innerHTML = `
            <td><input type="text" class="edit-coName" value="${name}"></td>
            <td><input type="email" class="edit-coEmail" value="${email}"></td>
            <td><input type="text" class="edit-coPhone" value="${phone}"></td>
            <td><textarea class="edit-coMessage">${message}</textarea></td>
            <td>${createdAt}</td>
            <td>${visibility}</td>
            <td>
                <i class="fas fa-save save-icon" data-id="${id}"></i>
                <i class="fas fa-times cancel-icon" data-id="${id}"></i>
            </td>
        `;

        // Attach event listeners to the save and cancel icons
        row.querySelector('.save-icon').addEventListener('click', saveComment);
        row.querySelector('.cancel-icon').addEventListener('click', cancelEdit);

        // Add validation to email and phone inputs
        const editEmailInput = row.querySelector('.edit-coEmail');
        const editPhoneInput = row.querySelector('.edit-coPhone');

        editEmailInput.addEventListener('input', validateEmail);
        editPhoneInput.addEventListener('input', validatePhone);
    }

    // Save comment function
    function saveComment(event) {
        const row = event.target.closest('tr');
        const id = row.dataset.id;

        // Get the updated values from the input fields
        const name = row.querySelector('.edit-coName').value;
        const email = row.querySelector('.edit-coEmail').value;
        const phone = row.querySelector('.edit-coPhone').value;
        const message = row.querySelector('.edit-coMessage').value;

        // Validate email and phone before sending
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        if (!isValidPhone(phone)) {
            alert('Please enter a valid 8-digit phone number.');  // Updated alert message
            return;
        }

        // Send the updated data to the server
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
            .then(response => response.json())
            .then(data => {
                fetchComments(); // Refresh table
                alert(data.message); // Show success message
            })
            .catch(error => console.error('Error updating comment:', error));
    }

    // Function to cancel the edit
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

    // Add a new comment
    addCommentForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const name = document.getElementById('newCoName').value;
        const email = document.getElementById('newCoEmail').value;
        const phone = document.getElementById('newCoPhone').value;
        const message = document.getElementById('newCoMessage').value;

        // Validate email and phone before sending
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        if (!isValidPhone(phone)) {
            alert('Please enter a valid 8-digit phone number.'); // Updated alert message
            return;
        }

        fetch('/customer/addComment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                coName: name,
                coEmail: email,
                coPhone: phone,
                coMessage: message
            })
        })
            .then(response => response.json())
            .then(data => {
                fetchComments(); // Refresh table
                addCommentForm.reset(); // Clear form
                alert(data.message); // Show success message
            })
            .catch(error => console.error('Error adding comment:', error));
    });

    // Validation functions
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^[0-9]{8}$/;  //  8-digit phone number regex
        return phoneRegex.test(phone);
    }

    function validateEmail(event) {
        const emailInput = event.target;
        if (!isValidEmail(emailInput.value)) {
            emailInput.setCustomValidity('Please enter a valid email address.');
        } else {
            emailInput.setCustomValidity('');
        }
        emailInput.reportValidity();
    }

    function validatePhone(event) {
        const phoneInput = event.target;
        if (!isValidPhone(phoneInput.value)) {
            phoneInput.setCustomValidity('Please enter a valid 8-digit phone number.'); // Updated custom validity message
        } else {
            phoneInput.setCustomValidity('');
        }
        phoneInput.reportValidity();
    }

    // Initial fetch of comments
    fetchComments();
});
