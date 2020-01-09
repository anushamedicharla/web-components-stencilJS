import { Component, Prop, h, State } from "@stencil/core";

@Component({
    tag: 'tool-tip',
    styleUrl: './tool-tip.css',
    shadow: true
})
export class ToolTip {
    @Prop({reflect: true}) text: string;
    @State() show = false;

    toggleToolTip() {
         this.show = !this.show;
    }

    render() {
        return (
            <div class="toolTip">
                <slot />
                <span class="icon" onClick={this.toggleToolTip.bind(this)}>?</span>
                <p class={this.show ? 'text active': 'text'}>{this.text}</p>
            </div>
        );
    }
}