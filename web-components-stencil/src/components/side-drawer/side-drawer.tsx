import { Component, h, Prop, State, Method } from '@stencil/core';

/*  Extending HTMLElement is done by Stencil itself when it converts our code 
    to vanilla JS web component code before it ships it to the browser. */

/*  This decorator defines the web component functionality to Stencil.
    We attach some metadata to this component 
    Giving shadow to tells stencil to ship this code with polyfills for the shadow DOM 
    support and to use the shadow DOM.
*/
@Component({
    tag: 'side-drawer',
    styleUrl: './side-drawer.css',
    shadow: true
})
/* To use this component outside of the file, we need to export it (typescript rules) */
export class SideDrawer {
    /*  Defining properties that the stencil will watch for attribute changes and 
        lets us skip the attributeChangedCallback method implementation which we otherwise 
        had to do in vanilla JS web components. 
        In order for stencil to register this as a property, we need a prop decorator.
        With reflect:true option passed, whenever the property changes, it will update the attribute.
        Props from default are immutable. They can be changed from outside but not from inside. To change them
        add mutable:true;
    */
    @Prop({ reflect: true }) headingTitle: string;
    @Prop({ reflect: true, mutable:true }) open: boolean;

    /*
        States are similar to properties except the changes for these states are not watched from outside but from
        inside this web component. If you change any state's value, it will also re run the render method and 
        update the DOM, similar to a prop.
    */
    @State() showContactInfo = false;

    onCloseDrawer() {
        this.open = false;
    }

    onContentChange(content: string) {
        this.showContactInfo = content === 'contact';
    }

    /* Decorator to make methods public */
    @Method()
    openSideDrawer() {
        this.open = true;
    }

    render() {
        /*
            Render is a reserved name in stencil where it uses it to parse the DOM 
            and generate the HTML elements. We have to return jsx code that has the
            DOM write instructions. It needs to have one root element or an array of 
            multiple elements.
        */
       
        let mainContent = <slot />; {/* Same as opening and closing the same empty tag */}
        if(this.showContactInfo) {
            mainContent = (
            <div id="contactInfo">
                <h2>Contact Information</h2>
                <p>You can reach us via phone or email.</p>
                <ul>
                    <li>Phone: 49802354545</li>
                    <li>Email: <a href="mailto:dummy@dummy.com">dummy@dummy.com</a></li>
                </ul>
            </div>
            );
        }
        
        /* Having an array of top level elements */
        return ([
            <div class="backdrop" onClick={this.onCloseDrawer.bind(this)}></div>,
            <div>
                <aside>
                    <header>
                        <h1>{this.headingTitle}</h1>
                        <button onClick={this.onCloseDrawer.bind(this)} class="close">X</button>
                    </header>
                    <section id="tabs">
                        <button class={!this.showContactInfo ? 'active' : ''} 
                            onClick={this.onContentChange.bind(this, 'nav')}>Navigation</button>
                        <button class={this.showContactInfo ? 'active' : ''} 
                            onClick={this.onContentChange.bind(this, 'contact')}>Contact</button>
                    </section>
                    <main>
                        {mainContent}
                    </main>
                </aside>
            </div>]
        );
    }
}

