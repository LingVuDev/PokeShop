// variables

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".clear-overlay");
const cartItems = document.querySelector(".clear-items");
const cartTotal = document.querySelector(".clear-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

let cart = [];

// Getting the products
class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;
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
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerHTML = "In Cart";
        button.disabled = true;
      } else {
        button.addEventListener("click", event => {
          event.target.innerHTML = "In Cart";
          event.target.disabled = true;
        });
      }
    });
  }
}

// Local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  // Get all products
  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
    });
});
