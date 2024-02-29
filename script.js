document.addEventListener("DOMContentLoaded", function () {
  // Initialize DOM elements and variables
  const gradientElement = document.body;
  const cursorCircle = document.createElement("div");
  cursorCircle.classList.add("cursor-circle");
  document.body.appendChild(cursorCircle);

  const cssOutput = document.getElementById("cssOutput");
  let gradientSizePx = 1700; // Default size of the gradient
  let currentColor1; // First color of the gradient
  let currentColor2; // Second color of the gradient
  let gradientString; // Gradient CSS string
  let currentPalette; // Current color palette function
  let currentButton; // Current palette button

  // Let's get the boring stuff out of the way!
  // First let's create three functions that will convert our HSL colors to HEX to display shorter texts in the #customTerminal.
  // 1 - Convert HSL to HEX (credits to https://www.jameslmilner.com/posts/converting-rgb-hex-hsl-colors/)
  function HSLToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
      const k = (n + h / 0.0833) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0"); // Convert to Hex and prefix with "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  // 2 - Extract HSL values from string
  function extractHSL(hslString) {
    const [h, s, l] = hslString
      .substring(4, hslString.length - 1)
      .replace(/%/g, "")
      .split(", ")
      .map(Number);
    return { h, s, l };
  }

  // 3 - Convert currentColor1 and currentColor2 to HEX
  let currentColor1Hex, currentColor2Hex;

  function convertCurrentColorsToHex() {
    const hsl1 = extractHSL(currentColor1);
    const hsl2 = extractHSL(currentColor2);
    currentColor1Hex = HSLToHex(hsl1.h, hsl1.s, hsl1.l);
    currentColor2Hex = HSLToHex(hsl2.h, hsl2.s, hsl2.l);
  }

  // Let's create an HSL color generator converting custom parameters to valid CSS HSL syntax
  // We'll be using the custom parameters to generate different color palettes
  function generateHSLColor(
    saturationMin,
    saturationMax,
    lightnessMin,
    lightnessMax,
    hue = Math.floor(Math.random() * 360) // If hue is undefined, generate a random hue.
  ) {
    const saturation = saturationMin + Math.random() * (saturationMax - saturationMin);
    const lightness = lightnessMin + Math.random() * (lightnessMax - lightnessMin);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  // Let's define a few color palettes to generate colors from, using our custom parametres and explicit hue for the monochromatic palette only
  function vibrantColor() {
    return generateHSLColor(70, 100, 40, 60); // saturation between 70% and 100% and lightness between 40% and 60%
  }
  function pastelColor() {
    return generateHSLColor(10, 50, 70, 80); // lower saturation for softer colors and high lightness for pastel effect
  }
  function monochromaticColor(hue) {
    return generateHSLColor(50, 100, 10, 100, hue); // medium to high saturation and lightness but explicit hue
  }

  // Create two random colors based on the currentPalette we just defined
  // Every time we call currentPalette(), it will generate a new color based on the currentPalette function
  function generateGradientColors() {
    // If the current palette is monochromatic, generate a random hue BUT USE IT FOR BOTH COLORS
    if (currentPalette === monochromaticColor) {
      const hue = Math.floor(Math.random() * 360);
      currentColor1 = currentPalette(hue);
      currentColor2 = currentPalette(hue);
    } else {
      currentColor1 = currentPalette();
      currentColor2 = currentPalette();
    }
    paintGradient(cursorCircle.offsetLeft, cursorCircle.offsetTop);
  }

  // Update the gradient based on the current colors and mouse position - also apply that gradient to the currently selected button
  function paintGradient(
    x = window.innerWidth / 2, // if x and y are undefined, use the center of the window.
    y = window.innerHeight / 2
  ) {
    const xPercent = (x / window.innerWidth) * 100; // Convert position to a percentage of the window width
    const yPercent = (y / window.innerHeight) * 100;
    gradientString = `radial-gradient(${gradientSizePx}px circle at ${xPercent.toFixed(2)}% ${yPercent.toFixed(2)}%, ${currentColor1} 0%, ${currentColor2} 100%)`; // Create the gradient CSS syntax string, limit % to 2 decimal places
    gradientElement.style.background = gradientString; // Apply the gradient background

    if (currentButton) {
      currentButton.style.background = gradientString; // Apply the gradient background to the current button
    }

    updateCssOutput(xPercent, yPercent); // Update the CSS output in the custom terminal and pass it the current mouse position
  }

  // Update the CSS output in the custom terminal
  function updateCssOutput(xPercent, yPercent) {
    convertCurrentColorsToHex(); // We wanna show our colors in HEX
    const gradientCSS = `background:<span class="property">radial-gradient</span>(<span class="value">${gradientSizePx}px circle at ${xPercent.toFixed(2)}% ${yPercent.toFixed(
      2
    )}%</span>, <span class="color">${currentColor1Hex}</span> 0%, <span class="color">${currentColor2Hex}</span> 100%);`;
    if (!isCopyMessageDisplayed) {
      cssOutput.innerHTML = gradientCSS;
    }
  }

  // Let's add mouse and wheel event listeners to change gradient position and size with the mouse

  let lastMouseX = 0; // Last known mouse X position
  let lastMouseY = 0; // Last known mouse Y position

  // mousemove will update the gradient and cursor circle position
  document.addEventListener("mousemove", function (e) {
    cursorCircle.style.left = e.pageX + "px";
    cursorCircle.style.top = e.pageY + "px";
    lastMouseX = e.pageX;
    lastMouseY = e.pageY;
    paintGradient(e.pageX, e.pageY);
  });

  // mousewheel will update the gradient size
  document.addEventListener("wheel", function (e) {
    var dynamicIncrement = Math.round(Math.max(20, gradientSizePx * 0.05));
    gradientSizePx = e.deltaY < 0 ? gradientSizePx + dynamicIncrement : Math.max(gradientSizePx - dynamicIncrement, 0);
    paintGradient(lastMouseX, lastMouseY);
  });

  // Add click event listeners to the palette buttons
  document.querySelectorAll(".palette-button").forEach((button) => {
    button.addEventListener("click", function (e) {
      // If the click event was triggered by a keyboard event, do nothing - avoid conflict with spacebar keydown event
      if (e.detail === 0) {
        return;
      }

      // Reset the background style and the default animation for the current button
      if (currentButton) {
        currentButton.style.background = ""; // Reset to CSS default
        currentButton.classList.remove("manualAnimation");
      }

      // Set the current button to the clicked button
      currentButton = this;

      switch (this.id) {
        case "vibrantBtn":
          currentPalette = vibrantColor;
          break;
        case "pastelBtn":
          currentPalette = pastelColor;
          break;
        case "monochromaticBtn":
          currentPalette = monochromaticColor;
          break;
      }
      generateGradientColors();
      paintGradient(e.clientX, e.clientY); // Use the mouse position at the time of the click
    });
  });

  // Add keyboard event listeners for Enter and Spacebar

  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      generateGradientColors();
      if (currentButton) {
        // If a palette button is selected
        currentButton.style.background = gradientString; // Apply the new gradient to the current button
      }
    }
    if (e.key === " ") {
      e.preventDefault(); // Prevent the default spacebar behavior
      copyToClipboard(cssOutput.textContent);
    }
  });

  // let's hide the cursor circle when the user is interacting with the instructions, palette buttons or custom terminal
  const instructions = document.getElementById("instructions");
  const paletteButtons = document.getElementById("paletteButtons");
  const customTerminal = document.getElementById("customTerminal");
  const builtBy = document.getElementById("builtBy");

  [instructions, paletteButtons, customTerminal, builtBy].forEach((element) => {
    element.addEventListener("mouseover", function () {
      cursorCircle.classList.add("cursor-circle-hidden");
      this.style.cursor = "auto"; // Show the default pointer mouse
    });

    element.addEventListener("mouseout", function () {
      cursorCircle.classList.remove("cursor-circle-hidden");
      this.style.cursor = "none"; // Hide the default pointer mouse
    });
  });

  // We need a function to display the "Copied!" message when user press Spacebar
  let isCopyMessageDisplayed = false; // Track whether the "Copied!" message is being displayed

  const copyToClipboard = (text) => {
    const originalHeight = customTerminal.offsetHeight + "px"; // Save the original height so it doesn't change when the "Copied!" message is displayed
    customTerminal.style.height = originalHeight; // Set the height

    navigator.clipboard
      .writeText(text)
      .then(() => {
        const originalOutput = cssOutput.innerHTML; // Save the original text output
        cssOutput.textContent = "Copied!";
        cssOutput.classList.add("copied-message"); // Add the new class
        isCopyMessageDisplayed = true;
        setTimeout(() => {
          cssOutput.innerHTML = originalOutput; // Restore the original text output
          cssOutput.classList.remove("copied-message"); // Remove the class
          customTerminal.style.height = ""; // Restore the original height
          isCopyMessageDisplayed = false;
        }, 2500);
      })
      .catch((err) => {
        console.error("Failed to copy CSS to clipboard: ", err);
      });
  };
  // We manually define a starting palette, its corresponding button and a manualAnimation to emulate a beginning focus.
  currentPalette = vibrantColor; // Initial color palette
  currentButton = document.getElementById("vibrantBtn"); // Initial palette button
  generateGradientColors();
  paintGradient();
  document.getElementById("vibrantBtn").classList.add("manualAnimation");
});
