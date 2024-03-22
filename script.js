const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCount = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const addressWarn = document.getElementById("address-warn");
let cart = [];

// Open modal cart
cartBtn.addEventListener("click", () => {
  updateCartModal();
  cartModal.style.display = "flex";
});

//Close modal on click fora
cartModal.addEventListener("click", (event) => {
  if (event.target === cartModal) {
    cartModal.style.display = "none";
  }
});

//Close modal on click in button "close"
closeModalBtn.addEventListener("click", () => {
  cartModal.style.display = "none";
});

menu.addEventListener("click", (event) => {
  //   console.log(event.target);
  // no closest deve-se passar conforme a seleçao de CSS com "." e "#"
  let parentButton = event.target.closest(".add-to-cart-btn");
  if (parentButton) {
    const name = parentButton.getAttribute("data-name");
    //Necessário transformar valores em float devido os calculos
    const price = parseFloat(parentButton.getAttribute("data-price"));

    //adiocnar no carrinho
    addToCart(name, price);
  }
});

// Function for add items in cart
function addToCart(name, price) {
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    // Se o item ja existe aumenta a sua quantidade + 1
    existingItem.quantity += 1;
  } else {
    cart.push({
      name,
      price,
      quantity: 1,
    });
  }
  updateCartModal();
}

//Update cart
function updateCartModal() {
  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.map((item) => {
    const cartItemElement = document.createElement("div");
    cartItemElement.innerHTML = `
    <div class="flex items-center justify-between px-2 mb-4 ">
        <div>
        <p class="font-bold">${item.name}</p>
        <p>Quantidade : ${item.quantity}</p>
        <p>Valor : R$ ${item.price.toFixed(2)}</p>
        </div>
        <button class="remove-from-cart-btn py-1 px-2 rounded-md bg-red-600 hover:bg-red-500 text-white"
         data-name="${item.name}">
         Remover
        </button>
    </div>`;

    total += item.price * item.quantity;
    cartItemsContainer.appendChild(cartItemElement);
  });

  cartTotal.innerHTML = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  cartCount.innerText = cart.length;
}

// Function for remove items in the cart
cartItemsContainer.addEventListener("click", (event) => {
  const name = event.target.getAttribute("data-name");
  removeItemCart(name);
});

function removeItemCart(name) {
  const index = cart.findIndex((item) => item.name === name);
  if (index !== -1) {
    const item = cart[index];

    if (item.quantity > 1) {
      item.quantity -= 1;
      updateCartModal();
      return;
    }

    cart.splice(index, 1);
    updateCartModal();
  }
}

//Finalizar pedido
checkoutBtn.addEventListener("click", () => {
  const isOpen = checkRestaurantOpen();
  if (!isOpen) {
    Toastify({
      text: "Restaurante fechado no momento",
      duration: 3000,
      close: true,
      gravity: "top", // `top` or `bottom`
      position: "right", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: {
        background: "#ef4444",
      },
    }).showToast();
    resetCartModal();
    return;
  }

  //Se o carrinho estiver vazio não faz nada. apenas retorna;
  if (cart.length === 0) return;

  //Se o carrinho estiver com alugm item, porém sem endereço.
  if (addressInput.value === "") {
    addressWarn.classList.remove("hidden");
    addressInput.classList.add("border-red-500");
  } else {
    addressWarn.innerText = "Pedido efetudo com sucesso";
    addressWarn.classList.add("text-green-500");
    addressInput.classList.add("border-green-500");
    setTimeout(() => {
      console.log(sendMessageWhatsapp());
      resetCartModal();
    }, 1500);
    return;
  }
});

// Verify date and hours in the restaurant
function checkRestaurantOpen() {
  const date = new Date();
  const hour = date.getHours();
  return hour >= 17 && hour < 23; //true se estiver aberto
}

const spanItem = document.getElementById("date-span");
const isOpen = checkRestaurantOpen();

if (isOpen) {
  spanItem.classList.add("bg-green-500");
  spanItem.classList.remove("bg-red-500");
} else {
  spanItem.classList.add("bg-red-500");
  spanItem.classList.remove("bg-green-500");
}

// Send message Whatsapp
function sendMessageWhatsapp() {
  const cartItems = cart
    .map((item) => {
      return `${item.name} Quantidade : (${item.quantity}) Valor : ${(
        item.price * item.quantity
      ).toFixed(2)}|`;
    })
    .join(""); //join para transformar os dados que estavam em array para String

  const message = encodeURIComponent(cartItems);
  const phone = "61982100358";

  window.open(
    `https://wa.me/${phone}?text=${message} Endereço: ${addressInput.value}`,
    "_blank"
  );

  console.log(cartItems);
}

//Reset cart modal
function resetCartModal() {
  cartModal.style.display = "none";
  addressWarn.innerText = "";
  addressInput.value = "";
  cartCount.innerText = "0";
  cart = [];
  updateCartModal();
}
