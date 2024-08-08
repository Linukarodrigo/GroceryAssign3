document.addEventListener('DOMContentLoaded', initialize);

function initialize() {
    setupSteps();
    loadOrderSummary();
    setupPaymentMethodToggle();

    let popup = document.getElementById("popup");
    let checkoutButton = document.getElementById("checkout-button");
    let okButton = document.getElementById("ok-button");
    
    checkoutButton.addEventListener("click", openPopup);
    okButton.addEventListener("click", closePopup);
}

// Function to open the popup
function openPopup() {
    const popup = document.getElementById("popup");
    const deliveryDateElement = document.querySelector(".checkoutContainer p");
    const today = new Date();
    const deliveryDate = new Date(today.setDate(today.getDate() + 3));
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    deliveryDateElement.innerText = `Your order will be delivered on ${deliveryDate.toLocaleDateString('en-US', options)}.`;
    popup.classList.add("openPopup");
}

// Function to close the popup
function closePopup() {
    const popup = document.getElementById("popup");
    popup.classList.remove("openPopup");
}

// Function to set up the steps in a multi-step form
function setupSteps() {
    const steps = document.querySelectorAll('.step');
    const stepItems = document.querySelectorAll('.step-item');
    let currentStep = 1;

    showStep(currentStep, steps, stepItems);

    window.nextStep = function(step) {
        if (validateCurrentStep(steps, currentStep)) {
            currentStep = step;
            showStep(currentStep, steps, stepItems);
        } else {
            reportInvalidStep(steps, currentStep);
        }
    };

    window.prevStep = function(step) {
        currentStep = step;
        showStep(currentStep, steps, stepItems);
    };
}

// Function to show a specific step
function showStep(step, steps, stepItems) {
    // Iterate over all steps
    for (let index = 0; index < steps.length; index++) {
        if (index === step - 1) {
            steps[index].style.display = 'block'; // Show the current step
        } else {
            steps[index].style.display = 'none'; // Hide all other steps
        }
    }

    // Iterate over all step items
    for (let index = 0; index < stepItems.length; index++) {
        if (index < step) {
            stepItems[index].classList.add('active'); // Add the 'active' class for steps before or at the current step
        } else {
            stepItems[index].classList.remove('active'); // Remove the 'active' class for steps after the current step
        }
    }
}

// Function to validate the current step's form
function validateCurrentStep(steps, currentStep) {
    const stepElement = steps[currentStep - 1];     // Get the step element for the current step index
    const currentForm = stepElement.querySelector('form');  // Find the form element within the current step

    // If there is a form, check if it is valid
    if (currentForm) {
        return currentForm.checkValidity();
    }

    return true; // If there's no form in the current step, consider it valid
}

// Function to report validity of the current step's form
function reportInvalidStep(steps, currentStep) {
    const currentForm = steps[currentStep - 1].querySelector('form');
    if (currentForm) {
        currentForm.reportValidity();
    }
}

// Function to load and display the order summary
function loadOrderSummary() {
    const orderSummary = JSON.parse(localStorage.getItem('orderSummary')) || [];
    const itemsContainer = document.querySelector('.order-summary');

    let subTotal = 0;

    clearItemsContainer();

    orderSummary.forEach(function(item) {
        subTotal = addOrderSummaryItem(item, itemsContainer, subTotal);
    });

    updateTotals(subTotal);
}

// Function to add an item to the order summary
function addOrderSummaryItem(item, itemsContainer, subTotal) {
    const { title, price, quantity, imageSrc } = item;
    const itemPrice = parseFloat(price.replace('Rs.', '').replace('/=', ''));
    const itemTotal = itemPrice * quantity;
    subTotal += itemTotal;

    const orderSummaryItem = createOrderSummaryItem(item, itemTotal);
    itemsContainer.insertBefore(orderSummaryItem, itemsContainer.querySelector('.separator'));

    return subTotal;
}

// Function to clear the items container
function clearItemsContainer() {
    const itemsContainer = document.querySelector('.order-summary');
    itemsContainer.innerHTML = `
        <h2>Order Summary</h2>
        <div class="separator"></div>
        <div class="summary-totals">
            <div class="total-row">
                <p class="total-title">Subtotal:</p>
                <p class="subtotal-value">Rs.0.00/=</p>
            </div>
            <div class="total-row">
                <p class="total-title">Tax (2%):</p>
                <p class="tax-value">Rs.0.00/=</p>
            </div>
            <div class="total-row">
                <p class="total-title">Delivery Fee:</p>
                <p class="shipping-value">Rs.0.00/=</p>
            </div>
            <div class="separator"></div>
            <div class="total-row">
                <p class="total-title"><strong>Total:</strong></p>
                <p class="total-value"><strong>Rs.0.00/=</strong></p>
            </div>
        </div>
    `;
}

// Function to create an order summary item
function createOrderSummaryItem(item, itemTotal) {
    const { title, imageSrc, quantity } = item;

    const orderSummaryItem = document.createElement('div');
    orderSummaryItem.classList.add('order-summary-item');

    orderSummaryItem.innerHTML = `
        <img class="item-image" src="${imageSrc}" alt="Product Image">
        <div class="item-details">
            <p class="item-title">${title}</p>
            <div class="item-quantity">
                <label for="quantity-${title}">Qty:</label>
                <p>${quantity}</p>
            </div>
            <p class="item-price">Rs.${itemTotal.toFixed(2)}/=</p>
        </div>
        <i class="fa fa-trash-o remove" onclick="removeItem('${title}')"></i>
    `;

    return orderSummaryItem;
}

// Function to update the totals
function updateTotals(subTotal) {
    const tax = subTotal * 0.02; // Assuming a tax rate of 2%
    const shipping = 0; // Assuming free shipping for the moment (It can be changed later)
    const total = subTotal + tax + shipping;

    document.querySelector('.subtotal-value').innerText = `Rs.${subTotal.toFixed(2)}/=`;
    document.querySelector('.tax-value').innerText = `Rs.${tax.toFixed(2)}/=`;
    document.querySelector('.shipping-value').innerText = `Rs.${shipping.toFixed(2)}/=`;
    document.querySelector('.total-value').innerText = `Rs.${total.toFixed(2)}/=`;
}

// Function to set up payment method toggle functionality
function setupPaymentMethodToggle() {
    const codRadio = document.getElementById('payment-cod');
    const cardRadio = document.getElementById('payment-card');
    const cardDetails = document.getElementById('card-details');

    // Attach event listeners to handle what type of payment method user used 
    codRadio.addEventListener('change', handlePaymentMethodChange);
    cardRadio.addEventListener('change', handlePaymentMethodChange);

    // Call the function to set the initial state
    toggleCardDetails(codRadio, cardRadio, cardDetails);
}

// Function to handle the payment method change event
function handlePaymentMethodChange() {
    const codRadio = document.getElementById('payment-cod');
    const cardRadio = document.getElementById('payment-card');
    const cardDetails = document.getElementById('card-details');

    toggleCardDetails(codRadio, cardRadio, cardDetails);
}

// Function to toggle card details based on selected payment method
function toggleCardDetails(codRadio, cardRadio, cardDetails) {
    const inputs = cardDetails.querySelectorAll('input');

    if (codRadio.checked) {
        inputs.forEach(input => {
            input.disabled = true;
            input.style.backgroundColor = '#f0f0f0';
        });
    } else if (cardRadio.checked) {
        inputs.forEach(input => {
            input.disabled = false;
            input.style.backgroundColor = '#fff';
        });
    }
}

// Function to remove an item from the order summary
window.removeItem = function(title) {
    let orderSummary = JSON.parse(localStorage.getItem('orderSummary')) || [];
    orderSummary = orderSummary.filter(item => item.title !== title);
    localStorage.setItem('orderSummary', JSON.stringify(orderSummary));
    loadOrderSummary();
};
