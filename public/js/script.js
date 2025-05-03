
// console.log("script.js loaded");  // ADD THIS LINE


document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');

    // Validation functions
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^[0-9]{8}$/;  // 8-digit phone number regex
        return phoneRegex.test(phone);
    }

    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const formData = new FormData(contactForm);
            const name = formData.get('coName');
            const email = formData.get('coEmail');
            const phone = formData.get('coPhone');
            const message = formData.get('coMessage');

            if (!isValidEmail(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            if (!isValidPhone(phone)) {
                alert('Please enter a valid 8-digit phone number.');
                return;
            }

            fetch('/customer/addComment', {
                method: 'POST',
                body: new URLSearchParams(formData),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .then(response => {
                    if (response.ok) {
                        alert(`Comment sent successfully! Thanks for your feedback, ${name}.`);
                        window.location.href = '/'; // Redirect to the homepage
                    } else {
                        alert('An error occurred while sending the comment.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred while sending the comment.');
                });
        });
    } else {
        console.warn('contactForm not found!');
    }
});



//new from 202504011

async function loadProducts() {
    try {
      // Fetch coffee products
      const coffeeResponse = await fetch('/coffees/allCoffeeList');
       
      const coffees = await coffeeResponse.json();
      coffees.sort((a, b) => a.name.localeCompare(b.name));
      const coffeeSelection = document.getElementById('coffeeSelection');
  
      coffees.forEach(coffee => {
        const row = document.createElement('tr');
        // console.log('coffee:', coffee);
        // Check if the coffee quantity is greater than 0
        // Initialize quantity to 0 for each coffee
        // console.log('coffee id', coffee._id);
        row.innerHTML = `
          <td>${coffee.name}</td>
          <td>${coffee.description}</td>
          <td>$${coffee.price.toFixed(2)}</td>
          <td>
            <div class="input-group">
                <button class="btn btn-outline-warning" type="button" onclick="changeQuantity('${coffee._id}', -1)" style="display: none;" id="decrease-${coffee._id}">-</button>
                <input type="number" min="0" data-id="${coffee._id}" value="0" class="form-control form-control-lg" onchange="calculateTotal()" />
                <button class="btn btn-outline-success" type="button" onclick="changeQuantity('${coffee._id}', 1)">+</button>
            </div>
          </td>
        `;
        coffeeSelection.appendChild(row);
      });
  
      // Fetch snack products
      const snackResponse = await fetch('/snacks/allSnackList');
      const snacks = await snackResponse.json();
      snacks.sort((a, b) => a.name.localeCompare(b.name));
      const snackSelection = document.getElementById('snackSelection');
  
      snacks.forEach(snack => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${snack.name}</td>
          <td>${snack.description}</td>
          <td>$${snack.price.toFixed(2)}</td>
          <td>
            <div class="input-group">
                <button class="btn btn-outline-warning" type="button" onclick="changeQuantity('${snack._id}', -1)" style="display: none;" id="decrease-${snack._id}">-</button>
                <input type="number" min="0" data-id="${snack._id}" value="0" class="form-control form-control-lg" onchange="calculateTotal()" />
                <button class="btn btn-outline-success" type="button" onclick="changeQuantity('${snack._id}', 1)">+</button>
            </div>
          </td>
        `;
        snackSelection.appendChild(row);
      });
    } catch (error) {
      console.error(error);
      alert('Error loading products. Please try again later.');
    }
  };

 //changeQuantity function uses for both coffee and snack items.
 function changeQuantity(id, change) {
    const inputField = document.querySelector(`input[data-id="${id}"]`);
    let currentQuantity = parseInt(inputField.value, 10) || 0;

    // Update quantity based on the change
    currentQuantity += change;

    if (currentQuantity < 0) currentQuantity = 0; // Prevent negative quantities
    if (currentQuantity > 99) currentQuantity = 99; // Limit to a maximum of 99
    inputField.value = currentQuantity; // Update the input field

    // Show or hide the decrease button based on current quantity
    const decreaseButton = document.getElementById(`decrease-${id}`);
    if (currentQuantity > 0) {
        decreaseButton.style.display = 'block'; // Show button
    } else {
        decreaseButton.style.display = 'none'; // Hide button
    }

    calculateTotal(); // Recalculate total based on updated quantities
}

// Cart count:

var cartCount = 0; // Initialize cart count

// Call this function to initialize the cart when the page loads
initializeCart();

function updateCartCount(count) {
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.innerText = count; // Set the cart count
    } else {
        console.error('Element with ID "cartCount" not found.');
    }
};

function initializeCart() {
    cartCount = 0; // Reset cart count
    updateCartCount(cartCount); // Update displayed count

    // Set initial values of input fields to 0
    document.querySelectorAll('#coffeeSelection input, #snackSelection input').forEach(input => {
        input.value = 0; 
        console.log('Input initialized to:', input.value);
    });

    // Add event listeners to inputs to update total on change
    document.querySelectorAll('#coffeeSelection input, #snackSelection input').forEach(input => {
        input.addEventListener('change', calculateTotal);
    });
}


function calculateTotal() {
    // console.log('calculateTotal called');
    let total = 0; 
    cartCount = 0;

    // Calculate total for coffee selections
    document.querySelectorAll('#coffeeSelection input').forEach(input => {
        const quantity = parseInt(input.value) || 0; // Default to 0 if NaN
        const price = parseFloat(input.closest('tr').querySelector('td:nth-child(3)').innerText.replace('$', ''));
        total += quantity * price;
        cartCount += quantity;
    });

    // Calculate total for snack selections
    document.querySelectorAll('#snackSelection input').forEach(input => {
        const quantity = parseInt(input.value) || 0; // Default to 0 if NaN
        const price = parseFloat(input.closest('tr').querySelector('td:nth-child(3)').innerText.replace('$', ''));
        total += quantity * price;
        cartCount += quantity;
    });

    updateCartCount(cartCount); // Update the cart count display
    document.getElementById('totalAmount').innerText = `$${formatNumber(total.toFixed(2))};`; // Update total amount display

    // Save to session on the server
    saveCartToSession(total);
};

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Function to save current cart to session
async function saveCartToSession(total) {
    const items = [];
    
    // Collect coffee selections
    document.querySelectorAll('#coffeeSelection input').forEach(input => {
        const quantity = parseInt(input.value) || 0;
        if (quantity > 0) {
            const price = parseFloat(input.closest('tr').querySelector('td:nth-child(3)').innerText.replace('$', ''));
            const productName = input.closest('tr').querySelector('td:nth-child(1)').innerText;
            items.push({ productId: input.getAttribute('data-id'), productName, quantity, price });
        }
    });

    // Collect snack selections
    document.querySelectorAll('#snackSelection input').forEach(input => {
        const quantity = parseInt(input.value) || 0;
        if (quantity > 0) {
            const price = parseFloat(input.closest('tr').querySelector('td:nth-child(3)').innerText.replace('$', ''));
            const productName = input.closest('tr').querySelector('td:nth-child(1)').innerText;
            items.push({ productId: input.getAttribute('data-id'), productName, quantity, price });
        }
    });

    // Send the cart data to the server
    try {
        const response = await fetch('/orders/addToCart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items, totalAmount: total }) // Send items and total
        });

        if (!response.ok) throw new Error('Failed to update cart on server');
        
        const result = await response.json();
        console.log('Server response:', result);
    } catch (error) {
        console.error('Error saving cart to session:', error);
    }
}

// Checkout and Reset orderForm
document.getElementById('orderForm').addEventListener('submit', async (e) => {
    e.preventDefault();  // Prevent default form submission
   
    const items = [];
    let totalAmount = 0; 

    // Collect coffee selections for DB
    document.querySelectorAll('#coffeeSelection input').forEach(input => {
        const quantity = parseInt(input.value);
        if (quantity > 0) {
            const price = parseFloat(input.closest('tr').querySelector('td:nth-child(3)').innerText.replace('$', ''));
            const productName = input.closest('tr').querySelector('td:nth-child(1)').innerText;
            totalAmount += quantity * price; // Calculate total amount
            items.push({ productId: input.getAttribute('data-id'), productName, quantity, productType: 'coffee', price });
        }
    });

    // Collect snack selections for DB
    document.querySelectorAll('#snackSelection input').forEach(input => {
        const quantity = parseInt(input.value);
        if (quantity > 0) {
            const price = parseFloat(input.closest('tr').querySelector('td:nth-child(3)').innerText.replace('$', ''));
            const productName = input.closest('tr').querySelector('td:nth-child(1)').innerText;
            totalAmount += quantity * price; // Calculate total amount
            items.push({ productId: input.getAttribute('data-id'), productName, quantity, productType: 'snack', price });
        }
    });

    const customerName = document.getElementById('customerName').value.trim();
    const customerEmail = document.getElementById('customerEmail').value.trim();

    // Check if there are any items before trying to place the order
    if (totalAmount === 0) {
        alert('Your order is empty, please select your order!');
        return; // Exit the function
    }

    // Place the order
    const response = await fetch('/orders/createOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, totalAmount, customerName, customerEmail })
    });

    if (response.ok) {
        alert('Order placed successfully! And confirmation email has been sent.');
        resetCart(); // Reset cart after successful checkout
        document.getElementById('orderForm').reset();
        setTimeout(() => {
            window.location.href = '/'; // Redirect to the homepage
        }, 1000);
    } else {
        const errorData = await response.json();
        alert(errorData.Error || 'Error placing order. Please try again later.');
    }
});

function resetCart() {
    cartCount = 0; // Reset cart count
    updateCartCount(0); // Update the display
}

// Function to display order history when the page loads
async function displayOrderHistory() {
    try {
        const response = await fetch('/orders/currentOrders'); // Ensure this endpoint exists
        if (!response.ok) throw new Error('Failed to fetch order details');

        const currentOrders = await response.json();
        const orderDetailsDiv = document.getElementById('orderDetails');
        orderDetailsDiv.innerHTML = ''; // Clear previous details

        if (currentOrders.length === 0) {
            orderDetailsDiv.innerHTML = '<p>No current orders.</p>';
        } else {
            currentOrders.forEach(order => {
                const orderHtml = `
                    <div class="order-item">
                        <h5>Order Date: ${new Date(order.orderDate).toLocaleString('en-hk')}</h5>
                        <p>Total Amount: $${order.totalAmount.toFixed(2)}</p>
                        <ul>
                            ${order.items.map(item => `<li>${item.productName} - Qty: ${item.quantity}, Price: $${item.price.toFixed(2)}</li>`).join('')}
                        </ul>
                    </div>
                `;
                orderDetailsDiv.innerHTML += orderHtml;
            });
        }
    } catch (error) {
        console.error('Error fetching order details:', error);
        alert('Error fetching order details. Please try again later.');
    }
}

// Load products on page load
// document.addEventListener('DOMContentLoaded', loadProducts);
// document.addEventListener('DOMContentLoaded', displayOrderHistory);
// document.addEventListener('DOMContentLoaded', function() {
//     initializeCart();
// });

document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    await displayOrderHistory();
    initializeCart();
});



// Function to display order details in the modal
async function displayCartDetails() {
  const orderDetailsDiv = document.getElementById('orderDetails');
  orderDetailsDiv.innerHTML = ''; // Clear previous details

  try {
      // Fetch current orders (latest order only)
      const response = await fetch('/orders/currentOrders');
      if (!response.ok) throw new Error('Failed to fetch order details');

      const currentOrders = await response.json();
      console.log('Fetched Current Orders:', currentOrders); // Log fetched orders

      if (currentOrders.length === 0) {
          orderDetailsDiv.innerHTML = '<p>No current orders.</p>';
      } else {
          const order = currentOrders[0]; // Get the latest order
          const orderHtml = `
              <div class="order-item">
                  <h5>Order Date: ${new Date(order.orderDate).toLocaleString('en-hk')}</h5>
                  <p class="amt-item">Total Amount: $${formatNumber(order.totalAmount.toFixed(2))}</p>
                  <ul class="modalCart-list">
                      ${order.items.map(item => `<li li::marker {color: green;} >${item.productName} - Qty: ${item.quantity}, Price: $${item.price.toFixed(2)}</li>`).join('')}
                  </ul>
              </div>
          `;
          orderDetailsDiv.innerHTML += orderHtml; // Display the latest order
      }

      // Show the modal using Bootstrap
      const orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
      orderModal.show();
  } catch (error) {
      console.error('Error fetching order details:', error);
      orderDetailsDiv.innerHTML = '<p>Error fetching order details. Please try again later.</p>';
  }
};

// Event listener for the Clear Cart button
document.getElementById('clearCartButton').addEventListener('click', async () => {
    // Show a confirmation dialog
    if (confirm("Are you sure you want to clear the cart?")) {
        try {
            const response = await fetch('/orders/clear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to clear the cart');

            // Clear the modal content and update the UI
            const orderDetailsDiv = document.getElementById('orderDetails');
            orderDetailsDiv.innerHTML = '<p>Your cart has been cleared.</p>';

            // Reset quantities in the order form
            resetOrderFormQuantities();
            // Optionally, update cart count in the main UI (if applicable)
            document.getElementById('cartCount').innerText = '0';

            console.log('Cart cleared successfully.');
        } catch (error) {
            console.error('Error clearing cart:', error);
            alert('Error clearing cart. Please try again later.');
        }
    } else {
        // User canceled the action
        alert('Cart clear action was canceled.');
    }
});

// Function to reset quantities in the order form
function resetOrderFormQuantities() {
  document.querySelectorAll('#coffeeSelection input, #snackSelection input').forEach(input => {
    input.value = 0;  // Reset each quantity input to '0'
  });
  // Reset the total amount
  const totalAmountElement = document.getElementById('totalAmount'); // Adjust this ID as needed
  if (totalAmountElement) {
      totalAmountElement.innerText = '0.00'; // Set total amount to '0.00'
  };
};

