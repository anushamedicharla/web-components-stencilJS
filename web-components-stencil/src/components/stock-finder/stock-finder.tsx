import { Component, h, State, Event, EventEmitter } from "@stencil/core";

import { AV_API_KEY } from '../../global/global';

@Component({
    tag: 'stock-finder',
    styleUrl: './stock-finder.css',
    shadow: true
})
export class StockFinder {
    stockNameInput: HTMLInputElement;

    @State() searchResults: {symbol: string, name: string}[] = [];
    @State() loading = false;

    /* Similar to vanilla JS web component events */
    @Event({bubbles: true, composed: true}) currentSymbolSelected: EventEmitter<string>;

    onFindStocks(event: Event) {
        this.loading = true;
        event.preventDefault();

        const stockName = this.stockNameInput.value;
        fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${stockName}&apikey=${AV_API_KEY}`)
        .then(res => res.json())
        .then(parsedRes => {
            this.searchResults = parsedRes['bestMatches'].map(match => {
                return { name: match['2. name'], symbol: match['1. symbol'] };
            });
            console.log(this.searchResults);
            this.loading = false;
        })
        .catch(err => {
            console.log(err.message);
            this.loading = false;
        });
    }

    onSelectSymbol(symbol: string) {
        this.currentSymbolSelected.emit(symbol);
    }

    render() {

        let content = <div>
                        <ul>
                            {this.searchResults.map(result => (
                            <li onClick={this.onSelectSymbol.bind(this, result.symbol)}>
                                <strong>{result.symbol}</strong>
                                - {result.name}
                            </li>
                            ))}
                        </ul>
                    </div>;

        if (this.loading) {
            content = <loading-spinner></loading-spinner>;
        }
        /* WE can even execute typecript expressions in these curly braces */
        return [
            <form onSubmit={this.onFindStocks.bind(this)}>
                <input id="stock-symbol" ref={el => this.stockNameInput = el}/>
                <button type="submit">Find!</button>
            </form>,
            content 
        ];
    }
}