import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems: CartItem[] = [];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  // session storage for cart
  storage: Storage = sessionStorage;

  // local storage test
  // storage: Storage = localStorage;

  constructor() {
    // session storage
    // Read data from storage, cartItems is the key
    const data = this.storage.getItem('cartItems');

    if (data !== null) {
      // Data is not null, so it's safe to parse
      this.cartItems = JSON.parse(data);
      // compute totals based on the data that is read form sotrage
      this.computeCartTotals();
    } else {
      // Handle the scenario when there is no data (e.g., initialize cartItems or set to default)
      this.cartItems = []; // or however you wish to initialize it
    }
  }


  // addToCart(theCartItem: CartItem) {

  //   // check if we already have the item in our cart
  //   let alreadyExistsInCart: boolean = false;
  //   let existingCartItem: CartItem = undefined;

  //   if (this.cartItems.length > 0) {
  //     // find the item in the cart based on item id

  //     existingCartItem = this.cartItems.find( tempCartItem => tempCartItem.id === theCartItem.id );

  //     // check if we found it
  //     alreadyExistsInCart = (existingCartItem != undefined);
  //   }

  //   if (alreadyExistsInCart) {
  //     // increment the quantity
  //     existingCartItem.quantity++;
  //   }
  //   else {
  //     // just add the item to the array
  //     this.cartItems.push(theCartItem);
  //   }

  //   // compute cart total price and total quantity
  //   this.computeCartTotals();
  // }

  addToCart(theCartItem: CartItem) {
    if (this.cartItems.length > 0) {
      let notIncluded: boolean = true;
      for (let j = 0; j < this.cartItems.length; j++) {
        if (this.cartItems[j].id === theCartItem.id) {
          this.cartItems[j].quantity++
          notIncluded = false;
          break;
        }
      }
      if (notIncluded == true) {
        this.cartItems.push(theCartItem);
      }
    } else {
      this.cartItems.push(theCartItem);
    }

    this.computeCartTotals();
  }


  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
      totalQuantityValue += currentCartItem.quantity;
    }

    // publish the new values .. all subscribers will receive the new data
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    this.logCartData(totalPriceValue, totalQuantityValue)

    // presist cart data form session storage
    this.presistCartItems();
  }

  // session storage, presist cart items using key: cartItems, and value(using Json stringify converts to json string)
  presistCartItems(){
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems))
  }


  logCartData(totalPriceValue: number, totalQuantityValue: number) {

    console.log('Contents of the cart');
    for (let tempCartItem of this.cartItems) {
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name}, 
                   quantity=${tempCartItem.quantity}, 
                   unitPrice=${tempCartItem.unitPrice},
                   subTotalPrice=${subTotalPrice}`)
    }

    console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuantity: ${totalQuantityValue}`)
    console.log(`----`)
  }


  decrementQuantity(theCartItem: CartItem) {

    theCartItem.quantity--;

    if (theCartItem.quantity === 0) {
      this.remove(theCartItem);
    }
    else {
      this.computeCartTotals();
    }
  }

  remove(theCartItem: CartItem) {
    // get index of item in the array
    const itemIndex = this.cartItems.findIndex(
      tempCartItem => tempCartItem.id === theCartItem.id
    )

    // if found, remove the item from the array at the given index
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);

      this.computeCartTotals();
    }
  }

}
