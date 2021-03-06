const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "26m1wb6ftuvf",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "8aooBUqER-Jg9Vj4BEQhGyS5tw6uIhmihDBRcYANZd8"
});

console.log(client);

// variables

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

let cart = [];

// buttons
let buttonsDOM = [];

// Getting the products
class Products {
  async getProducts() {
    try {
      let contentful = await client.getEntries();
      let products = contentful.items;
      products = products.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// Display products
class UI {
  setupUI() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }

  populateCart(cart) {
    cart.forEach(item => {
      this.addCartItem(item);
    });
  }

  displayProducts(products) {
    let result = "";
    products.forEach(product => {
      result += `
        <article class="product">
          <div class="img-container">
            <img
                class="product-img"
                src=${product.image}
                alt="product"
            />
            <button class="bag-btn" data-id="${product.id}">
                <i class="fas fa-shopping-cart"></i>
                add to bag
            </button>
            <h3>${product.title}</h3>
            <h4>${product.price}</h4>
        </div>
      </article>`;
    });
    productsDOM.innerHTML = result;
  }

  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerHTML = "In Cart";
        button.disabled = true;
      }
      // Add click event to each button
      button.addEventListener("click", event => {
        event.target.innerHTML = "In Cart";
        event.target.disabled = true;
        // get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // add product to the cart
        cart = [...cart, cartItem];
        // save cart in local storage
        Storage.saveCart(cart);
        // set cart values
        this.setCartValues(cart);
        // display cart item
        this.addCartItem(cartItem);
        // show the cart
        this.showCart();
      });
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src="${item.image}" alt="product" />
            <div>
                <h4>${item.title}</h4>
                <h5>$${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up increase-amount" data-id=${
                item.id
              }></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down decrease-amount" data-id=${
                item.id
              }></i>
            </div>
            `;
    cartContent.appendChild(div);
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  setCartInteractions() {
    // Clear cart button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });

    cartContent.addEventListener("click", event => {
      let target = event.target;
      let id = target.dataset.id;
      if (event.target.classList.contains("remove-item")) {
        cartContent.removeChild(target.parentElement.parentElement);
        this.removeItem(id);
      } else if (target.classList.contains("increase-amount")) {
        // Increment amount
        cart.map(item => {
          if (item.id === id) {
            item.amount++;
            target.nextElementSibling.innerText = item.amount;
          }
        });
        // Save storage
        Storage.saveCart(cart);
        // Set cart
        this.setCartValues(cart);
      } else if (target.classList.contains("decrease-amount")) {
        // Decrease amount
        cart.map(item => {
          if (item.id === id && item.amount > 1) {
            item.amount--;
            target.previousElementSibling.innerText = item.amount;
          }
        });
        // Save storage
        Storage.saveCart(cart);
        // Set cart
        this.setCartValues(cart);
      }
    });
  }

  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    while (cartContent.firstChild) {
      cartContent.removeChild(cartContent.firstChild);
    }
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }

  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }
}

// Local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

// Entry point
document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  ui.setupUI();

  // Get all products
  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.setCartInteractions();
    });
});
