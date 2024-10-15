import config from "../config.js";

function DisplayImage({ image, alt, width, height, borderRadius }) {
    console.log(image);
    return (
        <img
            src={(image.where === "server" ? config.serverUrl : "") + "/" + image.value}
            alt={alt || "Image"}
            style={{width: width || '', height: height || '', borderRadius: borderRadius || ''}}
        />
    );
}

export default DisplayImage;