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

// Main function to set up the steps in a multi-step form
function setupSteps() {
    const steps = document.querySelectorAll('.step');
    const stepItems = document.querySelectorAll('.step-item');
    let currentStep = 1;

    // Initial step display
    showStep(currentStep, steps, stepItems);

    // Define global functions for navigating steps
    window.nextStep = function(step) {
        if (validateStep(currentStep, steps)) {
            currentStep = step;
            showStep(currentStep, steps, stepItems);
        } 
        else {
            reportCurrentStepValidity(currentStep, steps);
        }
    };

    window.prevStep = function(step) {
        currentStep = step;
        showStep(currentStep, steps, stepItems);
    };
}

// Function to show a specific step
function showStep(step, steps, stepItems) {
    for (let i = 0; i < steps.length; i++) {
        if (i === step - 1) {
            steps[i].style.display = 'block'; // Show the current step
        } else {
            steps[i].style.display = 'none'; // Hide all other steps
        }
    }

    // Loop through each step item indicator
    for (let i = 0; i < stepItems.length; i++) {
        if (i < step) {
            stepItems[i].classList.add('active'); // Mark previous and current steps as active
        } 
        else {
            stepItems[i].classList.remove('active'); // Remove active status from future steps
        }
    }
}

// Function to validate the current step
function validateStep(step, steps) {
    // Get the form inside the current step
    const currentStepIndex = step - 1;
    const currentStep = steps[currentStepIndex];
    const form = currentStep.querySelector('form');

    // If there's a form, check if it's valid, otherwise return true
    if (form) {
        return form.checkValidity(); // Validate the form
    } 
    else {
        return true; 
    }
}


// Function to report validity of the current step
function reportCurrentStepValidity(currentStep, steps) {
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

    orderSummary.forEach(item => {
        const { title, price, quantity, imageSrc } = item;
        const itemPrice = parseFloat(price.replace('Rs.', '').replace('/=', ''));
        const itemTotal = itemPrice * quantity;
        subTotal += itemTotal;

        const orderSummaryItem = createOrderSummaryItem(item, itemTotal);
        itemsContainer.insertBefore(orderSummaryItem, itemsContainer.querySelector('.separator'));
    });

    updateTotals(subTotal);
}

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

    // Attach event listeners
    codRadio.addEventListener('change', () => toggleCardDetails(codRadio, cardRadio, cardDetails));
    cardRadio.addEventListener('change', () => toggleCardDetails(codRadio, cardRadio, cardDetails));

    // Call the function to set the initial state
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

// Function which enforce numbers only input on specific fields without getting alpha numeric values
function allowOnlyNumbers(input){
    input.value = input.value.replace(/\D/g, ''); // Remove non-digit characters
}

//Gets the IDs of inputs where the user entered values should be a numeric value
['card-number', 'card-cvc', 'postal-code', 'phone'].forEach(id => {
    document.getElementById(id).addEventListener('input', function (e) {
        allowOnlyNumbers(this);
    });
});
