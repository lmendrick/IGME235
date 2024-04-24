class Label {

    // Make a text object to be used as a axis value
    constructor(text, x, y, style) {
        this.text = new PIXI.Text(text, style);
        this.text.x = x;
        this.text.y = y;
        app.stage.addChild(this.text);
    }

    // Update the text
    setText(text) {
        this.text.text = text;
    }

    // Update the position
    setPostion(x, y) {
        this.text.x = x;
        this.text.y = y;
    }

    // Update the style
    setStyle(style) {
        this.text.style = style;
    }
}

