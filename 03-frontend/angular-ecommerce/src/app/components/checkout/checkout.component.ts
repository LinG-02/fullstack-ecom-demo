import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormControl, FormGroup, FormGroupName, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { PaymentInfo } from 'src/app/common/payment-info';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { FormService } from 'src/app/services/form.service';
import { CheckoutValidators } from 'src/app/validators/checkout-validators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup;

  storage: Storage = sessionStorage;

  // initialize Stripe API
  stripe = Stripe(environment.stripePublishableKey);

  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any="";

  isDisabled: boolean = false;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];


  constructor(
    private formBuilder: FormBuilder,
    private formService: FormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router
  ) { }

  ngOnInit(): void {

    // setup Stripe payment form
    this.setupStripePaymentForm();

    this.reviewCartDetails();

    // read the user's email address from browser storage
    const theEmail = JSON.parse(this.storage.getItem('userEmail')!);

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl(
          '',
          [Validators.required,
           Validators.minLength(2),
           CheckoutValidators.notOnlyWhitespace]
        ),
        lastName: new FormControl('',           
          [Validators.required,
          Validators.minLength(2),
          CheckoutValidators.notOnlyWhitespace]
        ),
        email: new FormControl(
          theEmail,
          [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]
         )
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('',           
          [Validators.required,
          Validators.minLength(2),
          CheckoutValidators.notOnlyWhitespace]
        ),
        city: new FormControl('',           
          [Validators.required,
          Validators.minLength(2),
          CheckoutValidators.notOnlyWhitespace]
        ),
        state: new FormControl('',Validators.required),
        country: new FormControl('',Validators.required),
        zipCode: new FormControl('',           
          [Validators.required,
          Validators.minLength(2),
          CheckoutValidators.notOnlyWhitespace]
        )
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('',           
          [Validators.required,
          Validators.minLength(2),
          CheckoutValidators.notOnlyWhitespace]
        ),
        city: new FormControl('',           
          [Validators.required,
          Validators.minLength(2),
          CheckoutValidators.notOnlyWhitespace]
        ),
        state: new FormControl('',Validators.required),
        country: new FormControl('',Validators.required),
        zipCode: new FormControl('',           
          [Validators.required,
          Validators.minLength(2),
          CheckoutValidators.notOnlyWhitespace]
        )
      }),
      creditCard: this.formBuilder.group({
        // cardType: new FormControl('', [Validators.required]),
        // nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), CheckoutValidators.notOnlyWhitespace]),
        // cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        // securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        // expirationMonth: [''],
        // expirationYear: ['']


      })
    });

    // popolate countries
    this.formService.getCountries().subscribe(
      data => {
        console.log("Retrived countries: " + JSON.stringify(data));
        this.countries = data;
      }
    );
  }
  
  
  setupStripePaymentForm() {
    // get a handle to stripe elements
    var elements = this.stripe.elements();

    // create a card element
    this.cardElement = elements.create('card', { hidePostalCode: true});

    // add en instance of a card UI component into the 'card-element' div
    this.cardElement.mount('#card-element')

    // add event binding for the 'change' event on the card element
    this.cardElement.on('change', (event:any) => {

      //get a handle to card-errors element
      this.displayError = document.getElementById('card-errors');

      if (event.complete) {
        this.displayError.textContent = "";
      } else if (event.error) {
        // show valication error to customer
        this.displayError.textContent = event.error.message;
      }

    })

  }

  reviewCartDetails() {

    // subscribe to cartService.totalQuantity
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    // subscribe to cartService.totalPrice
    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );

  }

  // get customer informaiton
  get firstName() { return this.checkoutFormGroup.get(`customer.firstName`); }
  get lastName() { return this.checkoutFormGroup.get(`customer.lastName`); }
  get email() { return this.checkoutFormGroup.get(`customer.email`); }
  get shippingAddressStreet() { return this.checkoutFormGroup.get(`shippmentAddress.street`); }
  get shippingAddressCity() { return this.checkoutFormGroup.get(`shippmentAddress.city`); }
  get shippingAddressState() { return this.checkoutFormGroup.get(`shippmentAddress.state`); }
  get shippingAddressZipCode() { return this.checkoutFormGroup.get(`shippmentAddress.zipCode`); }
  get shippingAddressCountry() { return this.checkoutFormGroup.get(`shippmentAddress.country`); }

  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }
  
  copyShippingAddressToBillingAddress(event: any) {

    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress']
        .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      // bug fix code for states
      this.billingAddressStates = this.shippingAddressStates;
    }
    else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      // bug fix code for state, leaves empty if addresses are different
      this.billingAddressStates = [];
    }

  }

  onSubmit() {
    // console.log("Handling the submit button");

    if (this.checkoutFormGroup.invalid) {
      this, this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cartService.cartItems;

    // create orderItems from cartItems
    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

    // set up purchase
    let purchase = new Purchase();
    
    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;
    
    // populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress?.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress?.country));
    purchase.shippingAddress!.state = shippingState.name;
    purchase.shippingAddress!.country = shippingCountry.name;

    // populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress?.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress?.country));
    purchase.billingAddress!.state = billingState.name;
    purchase.billingAddress!.country = billingCountry.name;
  
    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // cumpute payment info
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = "AUD";

    // email for develop mode - delete this part for formal use
    this.paymentInfo.receiptEmail = purchase.customer?.email;

    // for testing 
    console.log(`this.paymentInfo.amount: ${this.paymentInfo.amount}`);

    // if valid form then
    // - create payment intent
    // - comfirm card payment
    // - place order

    if (!this.checkoutFormGroup.invalid && this.displayError.textContent === "") {

      this.isDisabled = true;

      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
        (paymentIntentResponse) => {
          this.stripe.confirmCardPayment(
            paymentIntentResponse.client_secret,
            {
              payment_method: {
                card: this.cardElement,
                billing_details:{
                  email: purchase.customer?.email,
                  name: `${purchase.customer?.firtsName} ${purchase.customer?.lastName}`,
                  address: {
                    line1: purchase.billingAddress?.street,
                    city: purchase.billingAddress?.city,
                    state: purchase.billingAddress?.state,
                    postal_code: purchase.billingAddress?.zipCode,
                    country: this.billingAddressCountry?.value.code
                  }
                }
              }
            }, { handleActions: false }
          ).then((result: any) => {
            if (result.error) {
              // inform the customer there was an error
              alert(`There was an error: ${result.error.message}`);
              this.isDisabled = false;
            } else {
              // call REST API via the CheckoutService
              this.checkoutService.placeOrder(purchase).subscribe({
                  next: (response: any) => {
                    alert(`Your order has been receieved. \nOrder tracking number: ${response.orderTrackingNumber}`);
                    // reset cart
                    this.resetCart();
                    this.isDisabled = false;
                  },
                  error: (err: any) => {
                    alert(`There was an error: ${err.message}`);
                    this.isDisabled = false;
                  }
                })
            }
          })
        }
      );
    } else {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }


    /*
    // call REST API via the Chechkout service
    this.checkoutService.placeOrder(purchase).subscribe(
      {
        next: response => {
          alert(`Your order has been received. \nOrder tracking number: ${response.orderTrackingNumber}`)
          //reset cart
          this.resetCart();
          

        },
        error: err => {
          alert(`There was an error: ${err.message}`);
        }
      }
    );
    */


    // test
    //console.log(this.checkoutFormGroup.get('customer')?.value);
    //console.log("The email address is " + this.checkoutFormGroup.get('customer')?.value.email);
    //console.log("The shipping address country is " + this.checkoutFormGroup.get('shippingAddress')?.value.country.name)
    //console.log("The shipping address state is " + this.checkoutFormGroup.get('shippingAddress')?.value.state.name)
  }


  resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.presistCartItems();

    
    // reset the form
    this.checkoutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl("/products");


  }
/*
  handleMonthsAndYears() {

    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    // const currentYear: number = new Date.getFullYear();
    const currentDate = new Date(); // Creates a new Date object representing the current date and time
    const currentYear: number = currentDate.getFullYear(); // Correctly calls getFullYear on the instance of the date

    const selectedYear: number = Number(creditCardFormGroup!.value.expirationYear);

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    }
    else {
      startMonth = 1;
    }

    this.formService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved credit card months:" + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    )

  }
*/

  getStates(formGroupName: string) {

    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup!.value.country.code;
    const countryName = formGroup!.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.formService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        }
        else {
          this.billingAddressStates = data;
        }

        // select first item by default
        formGroup?.get('state')?.setValue(data[0]);

      }
    )

  }

}
