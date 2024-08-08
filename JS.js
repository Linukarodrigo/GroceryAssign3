document.addEventListener('DOMContentLoaded', readyToLoad);

function readyToLoad() {
    //Clear the cart items
    clearCart();

    // Event listeners for cart item removal buttons
    let removeCartItemButtons = document.getElementsByClassName("button-remove");
    for (let i = 0; i < removeCartItemButtons.length; i++) {
        let removeButton = removeCartItemButtons[i];
        removeButton.addEventListener('click', removeCartItems);
    }

    // Event listeners for quantity input changes
    let quantityInputs = document.getElementsByClassName('cart-quantity-input');
    for (let i = 0; i < quantityInputs.length; i++) {
        let quantityInput = quantityInputs[i];
        quantityInput.addEventListener('change', quantityChanged);
    }

    // Event listeners for add to cart buttons
    let addToCartButtons = document.getElementsByClassName('add-to-cart');
    for (let i = 0; i < addToCartButtons.length; i++) {
        let cartButton = addToCartButtons[i];
        cartButton.addEventListener('click', addToCart);
    }

    // Event listeners for opening and closing the cart
    let openCart = document.querySelector('.openCart');
    openCart.addEventListener('click', openCartClicked);

    let closeCart = document.querySelector('.closeCart');
    closeCart.addEventListener('click', closeCartClicked);

    // Load saved cart items from local storage
    const savedCart = localStorage.getItem('favoriteCart');
    if (savedCart) {
        const cartItems = JSON.parse(savedCart);
        console.log("Loading saved cart items:", cartItems);
        loadCartItems(cartItems);
    }

    //Calls the cart message function 
    updateCartMessage();

    // Event listeners for saving and loading favorites
    let saveFavoritesCart = document.querySelector('.save-to-favorites');
    saveFavoritesCart.addEventListener('click', saveFavorites);

    let loadFavoritesCart = document.querySelector('.apply-favorites');
    loadFavoritesCart.addEventListener('click', loadFavorites);

    // Add an event listener to the Buy Now button in the cart
    document.querySelector('.buyNow').addEventListener('click', handleBuyNow);
    
}

//Opening the cart
function openCartClicked() {
    document.body.classList.add('active');
}

//Closing the cart
function closeCartClicked() {
    document.body.classList.remove('active');
}

//If the cart is empty, show the message
function showEmptyCartMessage() {
    document.querySelector('.cart-empty-message').style.display = 'block';
}

//If the cart is not empty, hide the message
function hideEmptyCartMessage() {
    document.querySelector('.cart-empty-message').style.display = 'none';
}

//Update the cart message when the cart is empty / not empty
function updateCartMessage() {
    const cartItems = document.querySelector('.cart-items');
    if (cartItems.children.length === 0) {
        showEmptyCartMessage();
    } else {
        hideEmptyCartMessage();
    }
}

//It removes a cart item and updates the cart total.
function removeCartItems(event) {
    let buttonClicked = event.target;
    buttonClicked.parentElement.parentElement.remove();
    updateCartTotal();
    updateCartMessage();
}

//Calculates and updates the total price of items in the cart
function updateCartTotal() {
    let cartItemContainer = document.querySelector('.cart');
    let cartRows = cartItemContainer.getElementsByClassName('cart-row');
    let total = 0;

    for (let i = 0; i < cartRows.length; i++) {
        let cartRow = cartRows[i];
        let priceElement = cartRow.getElementsByClassName('cart-price')[0];
        let quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0];

        let unitPrice = parseFloat(priceElement.getAttribute('data-unit-price'));
        let quantity = parseFloat(quantityElement.value);
        let itemTotalPrice = unitPrice * quantity;

        // Update the displayed price for each item in the cart row
        priceElement.innerText = 'Rs.' + itemTotalPrice.toFixed(2) + '/=';

        total += itemTotalPrice;
    }

    document.querySelector('.cart-sub-total').innerText = 'Sub Total: Rs.' + total.toFixed(2) + '/=';
    document.querySelector('.cart-total').innerText = 'Rs.' + total.toFixed(2) + '/=';
}


//Ensures that the quantity input is valid and updates the cart total when the quantity is change
function quantityChanged(event) {
    let changeQuantity = event.target;
    if (isNaN(changeQuantity.value) || changeQuantity.value <= 0) {
        changeQuantity.value = changeQuantity.getAttribute('step') || 1;
    }
    updateCartTotal();
}

//Handles adding a product to the cart, ensuring the item is valid and then calling addProductsToCart.
function addToCart(event) {
    let addButton = event.target;
    let shopItem = addButton.closest('.product'); 
    let title = shopItem.querySelector('.product-title').innerText;
    let price = shopItem.querySelector('.product-price').innerText.replace('Price:', '');
    let imageSrc = shopItem.querySelector('.product-image').src;
    let quantityInput = shopItem.querySelector('.product-details input');
    let quantity = parseFloat(quantityInput.value);
    let step = quantityInput.getAttribute('data-step');

    if (isNaN(quantity) || quantity <= 0) {
        return;
    }
    
    addProductsToCart(title, price, imageSrc, quantity, step);
    updateCartTotal();
}

//Adds a product to the cart. If the product already exists, it updates the quantity instead
function addProductsToCart(title, price, imageSrc, quantity, step) {
    let cartRow = document.createElement('div');
    cartRow.classList.add('cart-row');
    let cartItems = document.querySelector('.cart-items');
    let cartItemNames = cartItems.getElementsByClassName('cart-item-title');

    for (let i = 0; i < cartItemNames.length; i++) {
        if (cartItemNames[i].innerText === title) {
            let existingQuantityElement = cartItemNames[i].closest('.cart-row').querySelector('.cart-quantity-input');
            existingQuantityElement.value = parseFloat(existingQuantityElement.value) + quantity;
            updateCartTotal();
            return;
        }
    }
    
    // Calculate total price for the item based on quantity
    let unitPrice = parseFloat(price.replace('Rs.', '').replace('/=', ''));
    let totalPrice = unitPrice * quantity;

    let cartRowContent = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
            <span class="cart-item-title">${title}</span>
        </div>
        <span class="cart-price cart-column" data-unit-price="${unitPrice}">Rs.${totalPrice.toFixed(2)}/=</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="${quantity}" step="${step}">
            <i class="fa fa-trash-o button-remove"></i>
        </div>`;

    cartRow.innerHTML = cartRowContent;

    cartRow.querySelector('.button-remove').addEventListener('click', removeCartItems);
    cartRow.querySelector('.cart-quantity-input').addEventListener('change', quantityChanged);

    cartItems.append(cartRow);
    updateCartMessage();
    updateCartTotal(); // Ensure total is updated after adding new item
}


//Saves the current cart items to local storage
function saveFavorites() {
    let cartItems = getCartItems();
    localStorage.setItem('favoriteCart', JSON.stringify(cartItems));
    console.log("Cart saved to favorites:", cartItems);
    alert('Cart saved to favorites!');
}

//Loads the saved cart items from local storage and updates the cart
function loadFavorites() {
    let savedCart = localStorage.getItem('favoriteCart');
    if (savedCart) {
        let cartItems = JSON.parse(savedCart);
        console.log("Favorites loaded:", cartItems);
        loadCartItems(cartItems);
        alert('Favorites loaded!');
    } else {
        alert('No favorites found!');
    }
}

//Gathers all the cart items and returns them as an array of objects
function getCartItems() {
    const cartItems = [];
    const cartRows = document.querySelectorAll('.cart-row');
    cartRows.forEach(row => {
        const itemTitleElement = row.getElementsByClassName('cart-item-title')[0];
        const itemPriceElement = row.getElementsByClassName('cart-price')[0];
        const itemQuantityElement = row.getElementsByClassName('cart-quantity-input')[0];
        const itemImageElement = row.getElementsByClassName('cart-item-image')[0];

        if (itemTitleElement && itemPriceElement && itemQuantityElement && itemImageElement) {
            const itemTitle = itemTitleElement.innerText;
            const itemPrice = itemPriceElement.innerText;
            const itemQuantity = itemQuantityElement.value;
            const itemImageSrc = itemImageElement.src;

            cartItems.push({ title: itemTitle, price: itemPrice, quantity: itemQuantity, imageSrc: itemImageSrc });
        } 
        else {
            console.error("Error: Missing elements in cart row:", row);
        }
    });
    return cartItems;
}

//Loads the cart items from an array, updates the cart, and ensures all necessary event listeners are attached
function loadCartItems(cartItems) {
    const cartContainer = document.querySelector('.cart-items');
    const existingCartRows = cartContainer.querySelectorAll('.cart-row');

    // Remove existing cart rows
    existingCartRows.forEach(row => row.remove());

    // Add new cart rows from saved items
    cartItems.forEach(item => {
        const cartRow = document.createElement('div');
        cartRow.classList.add('cart-row');
        cartRow.innerHTML = `
            <div class="cart-item cart-column">
                <img class="cart-item-image" src="${item.imageSrc}" width="100" height="100">
                <span class="cart-item-title">${item.title}</span>
            </div>
            <span class="cart-price cart-column">${item.price}</span>
            <div class="cart-quantity cart-column">
                <input class="cart-quantity-input" type="number" value="${item.quantity}">
                <i class="fa fa-trash-o button-remove"></i>
            </div>
        `;

        cartRow.querySelector('.button-remove').addEventListener('click', removeCartItems);
        cartRow.querySelector('.cart-quantity-input').addEventListener('change', quantityChanged);

        cartContainer.append(cartRow);
    });

    updateCartTotal();
    updateCartMessage();
}

//Clears the cart items from the Local storage and update the total
function clearCart() {
    const cartContainer = document.querySelector('.cart');
    const existingCartRows = cartContainer.querySelectorAll('.cart-row');

    // Remove existing cart rows from the DOM
    existingCartRows.forEach(row => row.remove());

    // Clear the cart items from local storage
    localStorage.removeItem('favoriteCart');

    updateCartTotal();
    updateCartMessage();
}

//saves the cart items to local storage and redirect to the Buy Now page
function handleBuyNow(event) {
    const cartItems = getCartItems();
    
    // Check if the cart is empty
    if (cartItems.length === 0) {
        event.preventDefault(); // Prevent the user redirecting to the next page (default action)
        alert('Your cart is empty. Please add items to your cart.');
    } 
    else {
        localStorage.setItem('orderSummary', JSON.stringify(cartItems));
        window.location.href = 'buyNow.html'; // Redirect to the Buy Now page
    }
}





