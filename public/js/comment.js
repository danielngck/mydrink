document.addEventListener('DOMContentLoaded', function () {
    const customerCommentsSection = document.getElementById('customerComments');

    // Function to fetch and display all visible comments
    function fetchVisibleComments() {
        fetch('/customer/getAllVisibleComments')
            .then(response => response.json())
            .then(comments => {
                customerCommentsSection.innerHTML = ''; // Clear section

                comments.forEach(comment => {
                    const commentDiv = document.createElement('div');
                    commentDiv.className = 'customer-comment';
                    commentDiv.innerHTML = `
                        <p><strong>${comment.coName}</strong></p>
                        <p>${comment.coMessage}</p>
                        <p class="comment-date">Posted on: ${new Date(comment.createdAt).toLocaleDateString()}</p>
                    `;
                    customerCommentsSection.appendChild(commentDiv);
                });
            })
            .catch(error => console.error('Error fetching visible comments:', error));
    }

    // Initial fetch of visible comments
    fetchVisibleComments();
});




