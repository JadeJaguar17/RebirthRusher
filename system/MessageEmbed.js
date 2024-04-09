class MessageEmbed {
    constructor() {
        this.fields = [];
        return this;
    }

    setAuthor(name, url) {
        this.author = { name: name, icon_url: url };
        return this;
    }

    setColor(color) {
        this.color = Number(color);
        return this;
    }

    setDescription(description) {
        this.description = description;
        return this;
    }

    addFields(...fields) {
        fields.forEach(field => this.fields.push(field));
        return this;
    }

    setFooter(footer) {
        this.footer = { text: footer };
        return this;
    }

    setImage(url) {
        this.image = { url: url };
        return this;
    }

    setThumbnail(url) {
        this.thumbnail = { url: url };
        return this;
    }

    setTimestamp() {
        this.timestamp = new Date();
        return this;
    }

    setTitle(title) {
        this.title = title;
        return this;
    }
}

module.exports = MessageEmbed;
