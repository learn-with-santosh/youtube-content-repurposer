const { createCanvas, registerFont } = require("canvas");
const sharp = require("sharp");

class ImageService {
  /**
   * Generate carousel slide images
   */
  static async generateCarouselImages(carouselData) {
    const slides = [];
    const width = 1080;
    const height = 1080;

    for (const slide of carouselData.slides) {
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = slide.backgroundColor || "#1a1a2e";
      ctx.fillRect(0, 0, width, height);

      // Add decorative elements
      this.addDecorativeElements(ctx, width, height, slide.backgroundColor);

      // Emoji
      if (slide.emoji) {
        ctx.font = "80px Arial";
        ctx.textAlign = "center";
        ctx.fillText(slide.emoji, width / 2, 200);
      }

      // Headline
      ctx.fillStyle = slide.textColor || "#ffffff";
      ctx.font = "bold 48px Arial";
      ctx.textAlign = "center";
      this.wrapText(ctx, slide.headline, width / 2, 350, width - 120, 60);

      // Subtext
      if (slide.subtext) {
        ctx.fillStyle = (slide.textColor || "#ffffff") + "CC";
        ctx.font = "28px Arial";
        this.wrapText(ctx, slide.subtext, width / 2, 600, width - 160, 40);
      }

      // Slide number
      ctx.fillStyle = (slide.textColor || "#ffffff") + "80";
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        `${slide.slideNumber} / ${carouselData.slides.length}`,
        width / 2,
        height - 60,
      );

      // Convert to buffer
      const buffer = canvas.toBuffer("image/png");
      const optimized = await sharp(buffer).png({ quality: 90 }).toBuffer();

      slides.push({
        slideNumber: slide.slideNumber,
        image: optimized.toString("base64"),
        mimeType: "image/png",
      });
    }

    return slides;
  }

  /**
   * Generate infographic image
   */
  static async generateInfographicImage(infographicData) {
    const width = 800;
    const sectionHeight = 200;
    const headerHeight = 300;
    const footerHeight = 100;
    const height =
      headerHeight +
      infographicData.sections.length * sectionHeight +
      footerHeight;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const colors = infographicData.colorScheme || {
      primary: "#667eea",
      secondary: "#764ba2",
      accent: "#f093fb",
      background: "#0f0f23",
    };

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, colors.background);
    gradient.addColorStop(1, this.darkenColor(colors.background, 20));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Header
    ctx.fillStyle = colors.primary;
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    this.wrapText(ctx, infographicData.title, width / 2, 80, width - 80, 45);

    ctx.fillStyle = "#ffffffCC";
    ctx.font = "20px Arial";
    this.wrapText(
      ctx,
      infographicData.subtitle || "",
      width / 2,
      180,
      width - 80,
      30,
    );

    // Divider
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 220);
    ctx.lineTo(width - 100, 220);
    ctx.stroke();

    // Sections
    infographicData.sections.forEach((section, index) => {
      const y = headerHeight + index * sectionHeight;

      // Section background
      if (index % 2 === 0) {
        ctx.fillStyle = "#ffffff08";
        ctx.fillRect(40, y, width - 80, sectionHeight - 20);
      }

      // Icon/Emoji
      ctx.font = "40px Arial";
      ctx.textAlign = "left";
      ctx.fillText(section.icon || "📌", 60, y + 50);

      // Heading
      ctx.fillStyle = colors.primary;
      ctx.font = "bold 24px Arial";
      ctx.fillText(section.heading, 120, y + 45);

      // Content
      ctx.fillStyle = "#ffffffCC";
      ctx.font = "18px Arial";
      this.wrapText(ctx, section.content, 120, y + 80, width - 200, 24, "left");

      // Highlight
      if (section.highlight) {
        ctx.fillStyle = colors.accent;
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "right";
        ctx.fillText(section.highlight, width - 60, y + 50);
        ctx.textAlign = "left";
      }
    });

    // Footer
    const footerY = height - footerHeight;
    ctx.fillStyle = "#ffffff60";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(infographicData.footer || "", width / 2, footerY + 50);

    const buffer = canvas.toBuffer("image/png");
    const optimized = await sharp(buffer).png({ quality: 90 }).toBuffer();

    return {
      image: optimized.toString("base64"),
      mimeType: "image/png",
      width,
      height,
    };
  }

  /**
   * Helper: Wrap text on canvas
   */
  static wrapText(ctx, text, x, y, maxWidth, lineHeight, align = "center") {
    ctx.textAlign = align;
    const words = text.split(" ");
    let line = "";
    let currentY = y;

    for (const word of words) {
      const testLine = line + word + " ";
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && line !== "") {
        ctx.fillText(line.trim(), x, currentY);
        line = word + " ";
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
  }

  /**
   * Helper: Add decorative elements
   */
  static addDecorativeElements(ctx, width, height, bgColor) {
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = "#ffffff";

    // Circles
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 100 + 50,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  /**
   * Helper: Darken a hex color
   */
  static darkenColor(hex, percent) {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max(((num >> 8) & 0x00ff) - amt, 0);
    const B = Math.max((num & 0x0000ff) - amt, 0);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }
}

module.exports = ImageService;
