import { Component, h, State, Element, Method, Prop, Watch, Listen } from "@stencil/core";
import { AV_API_KEY } from '../../global/global';
 
@Component({
    tag: 'stock-price',
    styleUrl: './stock-price.css',
    shadow: true
})
export class StockPrice {

    stockInput: HTMLInputElement;
    // initialStockSymbol: string;

    /* This element decorator property holds a reference to our web component */
    @Element() el: HTMLElement;
    @State() fetchPrice: number;
    @State() stockUserInput: string;
    @State() stockInputValid = false;
    @State() errProp: string;
    @State() loading = false;
    

    @Prop({mutable: true, reflect: true}) inputStockSymbol: string;

    /*  Takes the prop name as argument and sets up a watcher behind the scenes just like observec 
        attributes in vanilla JS web components */
    @Watch('inputStockSymbol')
    stockSymbolChanged(newVal: string, oldVal: string){
        if(newVal !== oldVal) {
            this.stockUserInput = newVal;
            this.fetchStockPrice(newVal);
        }
    }

    componentDidUnload(){
        console.log('Component did unload');
        /*  5th Lifecycle Hook: To perform operation when the component was removed from the DOM.
            And is a great place for any cleanup work. */
    }

    componentDidUpdate(){
        console.log('Component did update');
        /*  4th Lifecycle Hook: To perform operation when it re-renders because some prop or
            state chanegd */
        // if(this.inputStockSymbol !== this.initialStockSymbol) {
        //     this.initialStockSymbol = this.inputStockSymbol;
        //     this.fetchStockPrice(this.inputStockSymbol);
        // }
    }

    /* 
        This Listen decorator allows us to any emited events. By default it only listens for events inside this shadow DOM.
        To ensure for it to listen to any global event, we need to attach 'body:' to the event name.
    */
    @Listen('body:currentSymbolSelected')
    onStockSymbolSelected(event: CustomEvent) {
        console.log('stock symbol selected', event.detail);
        if(event.detail && event.detail !== this.inputStockSymbol) {
            this.inputStockSymbol = event.detail;
            this.stockInputValid = true;
        }
    }

    componentWillUpdate(){
        console.log('Component will update');
        /*  3rd Lifecycle Hook: To perform operation right before it re-renders because some prop or
            state chanegd */
    }

    componentDidLoad(){
        console.log('Component did load');
        console.log(this.inputStockSymbol);
        /* 2st Lifecycle Hook: To perform operation when this component has loaded successfully */
    }

    componentWillLoad() {
        /*  1st Lifecycle Hook: To perform operation right before this component has loaded successfully.
            i.e before running the render method for the first time. We can still make changes to the state 
            and prop attributes here but the changes will be rendered in the next render method run. */
        console.log('Component will load', );
        if(this.inputStockSymbol){
            // this.initialStockSymbol = this.inputStockSymbol;
            this.stockUserInput = this.inputStockSymbol;
            this.stockInputValid = true;
            this.fetchStockPrice(this.inputStockSymbol);
        }
    }

    onFetchStockPrice(event: Event) {
        /* typecasting with 'as' keyword */
        // const stockSymbol = (this.el.shadowRoot.querySelector('#stock-symbol') as HTMLInputElement).value;
        this.inputStockSymbol = this.stockInput.value;
        event.preventDefault();
        // this.fetchStockPrice(this.inputStockSymbol);
        console.log('Submitted...');
    }

    /*  A reserved method name that can return some metadata about this custom host element.
        Hostdata is executed whenever render method is executed. */
    hostData() {
        return {
            class: this.errProp ? 'error' : ''
        }
    }

    fetchStockPrice(stockSymbol:string) {
        this.loading = true;
        /* Fetch API is built into modern browsers */
        fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${AV_API_KEY}`)
            .then(res => {
                this.loading = false;
                return res.json();
            })
            .then(parsedRes => {
                if(!parsedRes['Global Quote'] || !parsedRes['Global Quote']['05. price']){
                    throw new Error('Invalid Symbol!');
                }
                this.fetchPrice = +parsedRes['Global Quote']['05. price'];
                console.log(parsedRes);
                this.errProp = null;
            })
            .catch(err => {
                this.loading = false;
                this.errProp = err.message;
                this.fetchPrice = null;
            });
    }

    onUserInput(event: Event){
        /* This is a 2 way binding where we assign the input field with the updated value and here 
            vice versa where we assign the property the updated input value. */
        this.stockUserInput = (event.target as HTMLInputElement).value;

        if(this.stockUserInput.trim() !== '') {
            this.stockInputValid = true;
        } else {
            this.stockInputValid = false;
        }
    }
    render() {
        let dataContent = <p>Please enter a stock symbol!</p>;
        if(this.errProp) {
            dataContent = <p>{this.errProp}</p>
        } else if (this.fetchPrice) {
            dataContent = <p>Price: ${this.fetchPrice}</p>;
        } 

        if(this.loading) {
            dataContent = <loading-spinner></loading-spinner>;
        }
        /*  ref attribute is a feature of stencil that allows us to assign our class prop to an HTML element refernce 
            using a callback Method. This way is an alternative to using the @Element decorator for the whole
            host component. */
        return [
            <form onSubmit={this.onFetchStockPrice.bind(this)}>
                <input id="stock-symbol" ref={el => this.stockInput = el}
                    value={this.stockUserInput}
                    onInput={this.onUserInput.bind(this)}/>
                <button type="submit" disabled={!this.stockInputValid || this.loading}>Fetch</button>
            </form>,
            <div>
                {dataContent}
            </div>
        ];
    }
}