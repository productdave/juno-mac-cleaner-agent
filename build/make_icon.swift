import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers
import AppKit

func drawIcon(size: Int) -> CGImage? {
    let s = CGFloat(size)
    let cs = CGColorSpaceCreateDeviceRGB()
    guard let ctx = CGContext(
        data: nil,
        width: size, height: size,
        bitsPerComponent: 8,
        bytesPerRow: 0,
        space: cs,
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    ) else { return nil }

    ctx.translateBy(x: 0, y: s)
    ctx.scaleBy(x: 1, y: -1)

    func x(_ v: CGFloat) -> CGFloat { v * s }
    func pt(_ px: CGFloat, _ py: CGFloat) -> CGPoint { CGPoint(x: px * s, y: py * s) }

    // --- Rounded square background: soft periwinkle blue like the photo ---
    let margin = s * 0.08
    let rectSize = s - margin * 2
    let rect = CGRect(x: margin, y: margin, width: rectSize, height: rectSize)
    let corner = rectSize * 0.225

    let bgPath = CGPath(roundedRect: rect, cornerWidth: corner, cornerHeight: corner, transform: nil)

    ctx.saveGState()
    ctx.addPath(bgPath)
    ctx.clip()
    let bgColors = [
        CGColor(red: 0.62, green: 0.72, blue: 0.90, alpha: 1.0),
        CGColor(red: 0.55, green: 0.65, blue: 0.88, alpha: 1.0),
    ] as CFArray
    let bgGrad = CGGradient(colorsSpace: cs, colors: bgColors, locations: [0.0, 1.0])!
    ctx.drawLinearGradient(bgGrad, start: CGPoint(x: rect.minX, y: rect.minY), end: CGPoint(x: rect.maxX, y: rect.maxY), options: [])
    ctx.restoreGState()

    // Subtle border
    ctx.addPath(bgPath)
    ctx.setStrokeColor(CGColor(red: 1, green: 1, blue: 1, alpha: 0.15))
    ctx.setLineWidth(s * 0.005)
    ctx.strokePath()

    // --- Colors ---
    let mint = CGColor(red: 0.60, green: 0.93, blue: 0.85, alpha: 1.0)
    let mintDark = CGColor(red: 0.48, green: 0.82, blue: 0.74, alpha: 1.0)
    let mintShadow = CGColor(red: 0.42, green: 0.76, blue: 0.70, alpha: 0.5)
    let cream = CGColor(red: 0.96, green: 0.95, blue: 0.86, alpha: 1.0)
    let creamLine = CGColor(red: 0.88, green: 0.86, blue: 0.78, alpha: 0.6)
    let hornColor = CGColor(red: 0.45, green: 0.42, blue: 0.40, alpha: 1.0)
    let white = CGColor(red: 1, green: 1, blue: 1, alpha: 1)
    let black = CGColor(red: 0.08, green: 0.06, blue: 0.12, alpha: 1)

    // ============================================
    // BODY — big round chubby shape
    // ============================================
    let bodyCx: CGFloat = 0.50
    let bodyCy: CGFloat = 0.58
    let bodyRx: CGFloat = 0.22
    let bodyRy: CGFloat = 0.24
    let bodyRect = CGRect(x: x(bodyCx - bodyRx), y: x(bodyCy - bodyRy), width: x(bodyRx * 2), height: x(bodyRy * 2))
    ctx.setFillColor(mint)
    ctx.fillEllipse(in: bodyRect)

    // ============================================
    // HEAD — very large, round, overlapping body top
    // ============================================
    let headCx: CGFloat = 0.50
    let headCy: CGFloat = 0.38
    let headR: CGFloat = 0.20
    let headRect = CGRect(x: x(headCx - headR), y: x(headCy - headR * 1.0), width: x(headR * 2), height: x(headR * 2.0))
    ctx.setFillColor(mint)
    ctx.fillEllipse(in: headRect)

    // Snout area — slight wider bump at bottom of head
    let snoutRect = CGRect(x: x(0.40), y: x(0.40), width: x(0.20), height: x(0.12))
    ctx.setFillColor(mint)
    ctx.fillEllipse(in: snoutRect)

    // ============================================
    // HORN — single dark horn on top center
    // ============================================
    let horn = CGMutablePath()
    horn.move(to: pt(0.47, 0.22))
    horn.addQuadCurve(to: pt(0.50, 0.14), control: pt(0.48, 0.17))
    horn.addQuadCurve(to: pt(0.53, 0.22), control: pt(0.52, 0.17))
    horn.closeSubpath()
    ctx.addPath(horn)
    ctx.setFillColor(hornColor)
    ctx.fillPath()

    // ============================================
    // BELLY — cream oval with horizontal lines
    // ============================================
    let bellyCx: CGFloat = 0.50
    let bellyCy: CGFloat = 0.60
    let bellyRx: CGFloat = 0.135
    let bellyRy: CGFloat = 0.16
    let bellyRect = CGRect(x: x(bellyCx - bellyRx), y: x(bellyCy - bellyRy), width: x(bellyRx * 2), height: x(bellyRy * 2))
    ctx.setFillColor(cream)
    ctx.fillEllipse(in: bellyRect)

    // Horizontal belly lines
    ctx.setStrokeColor(creamLine)
    ctx.setLineWidth(x(0.004))
    let lineYs: [CGFloat] = [0.52, 0.56, 0.60, 0.64, 0.68]
    for ly in lineYs {
        // Calculate horizontal extent of the belly ellipse at this y
        let dy = (ly - bellyCy) / bellyRy
        if abs(dy) >= 1.0 { continue }
        let halfW = bellyRx * sqrt(1.0 - dy * dy)
        let lx1 = bellyCx - halfW + 0.01
        let lx2 = bellyCx + halfW - 0.01
        ctx.move(to: pt(lx1, ly))
        ctx.addLine(to: pt(lx2, ly))
        ctx.strokePath()
    }

    // Belly spiral
    ctx.setStrokeColor(creamLine)
    ctx.setLineWidth(x(0.005))
    let spiral = CGMutablePath()
    let spiralCx: CGFloat = 0.50
    let spiralCy: CGFloat = 0.58
    // Simple spiral: 1.5 turns
    for i in 0...36 {
        let t = CGFloat(i) / 36.0
        let angle = t * 3.0 * .pi
        let r = t * 0.035
        let sx = spiralCx + cos(angle) * r
        let sy = spiralCy + sin(angle) * r
        if i == 0 { spiral.move(to: pt(sx, sy)) }
        else { spiral.addLine(to: pt(sx, sy)) }
    }
    ctx.addPath(spiral)
    ctx.strokePath()

    // ============================================
    // ARMS — stubby rounded arms on sides
    // ============================================
    // Left arm
    let leftArm = CGMutablePath()
    leftArm.move(to: pt(0.30, 0.50))
    leftArm.addQuadCurve(to: pt(0.22, 0.56), control: pt(0.24, 0.48))
    leftArm.addQuadCurve(to: pt(0.24, 0.62), control: pt(0.20, 0.60))
    leftArm.addQuadCurve(to: pt(0.32, 0.58), control: pt(0.26, 0.64))
    leftArm.closeSubpath()
    ctx.addPath(leftArm)
    ctx.setFillColor(mint)
    ctx.fillPath()

    // Subtle shadow on left arm
    ctx.addPath(leftArm)
    ctx.setFillColor(mintShadow)
    ctx.fillPath()

    // Left arm as the visible mint arm
    let leftArmVis = CGMutablePath()
    leftArmVis.move(to: pt(0.31, 0.50))
    leftArmVis.addQuadCurve(to: pt(0.23, 0.55), control: pt(0.25, 0.49))
    leftArmVis.addQuadCurve(to: pt(0.25, 0.61), control: pt(0.21, 0.59))
    leftArmVis.addQuadCurve(to: pt(0.33, 0.57), control: pt(0.27, 0.63))
    leftArmVis.closeSubpath()
    ctx.addPath(leftArmVis)
    ctx.setFillColor(mint)
    ctx.fillPath()

    // Right arm
    let rightArm = CGMutablePath()
    rightArm.move(to: pt(0.69, 0.50))
    rightArm.addQuadCurve(to: pt(0.77, 0.55), control: pt(0.75, 0.49))
    rightArm.addQuadCurve(to: pt(0.75, 0.61), control: pt(0.79, 0.59))
    rightArm.addQuadCurve(to: pt(0.67, 0.57), control: pt(0.73, 0.63))
    rightArm.closeSubpath()
    ctx.addPath(rightArm)
    ctx.setFillColor(mint)
    ctx.fillPath()

    // ============================================
    // FEET — round stumpy feet at bottom
    // ============================================
    // Left foot
    let lfRect = CGRect(x: x(0.30), y: x(0.72), width: x(0.14), height: x(0.10))
    ctx.setFillColor(mint)
    ctx.fillEllipse(in: lfRect)
    // Foot pad
    let lfPad = CGRect(x: x(0.33), y: x(0.74), width: x(0.08), height: x(0.06))
    ctx.setFillColor(cream)
    ctx.fillEllipse(in: lfPad)

    // Right foot
    let rfRect = CGRect(x: x(0.56), y: x(0.72), width: x(0.14), height: x(0.10))
    ctx.setFillColor(mint)
    ctx.fillEllipse(in: rfRect)
    // Foot pad
    let rfPad = CGRect(x: x(0.59), y: x(0.74), width: x(0.08), height: x(0.06))
    ctx.setFillColor(cream)
    ctx.fillEllipse(in: rfPad)

    // ============================================
    // EYES — big, round, shiny black eyes
    // ============================================
    let eyeY: CGFloat = 0.36
    let eyeR: CGFloat = 0.048
    let eyeLx: CGFloat = 0.42
    let eyeRx: CGFloat = 0.58

    for ex in [eyeLx, eyeRx] {
        // Black eye
        let eyeRect = CGRect(x: x(ex - eyeR), y: x(eyeY - eyeR), width: x(eyeR * 2), height: x(eyeR * 2))
        ctx.setFillColor(black)
        ctx.fillEllipse(in: eyeRect)

        // Large white shine (top-left)
        let shineR: CGFloat = 0.018
        let shineRect = CGRect(
            x: x(ex - 0.018 - shineR),
            y: x(eyeY - 0.018 - shineR),
            width: x(shineR * 2),
            height: x(shineR * 2)
        )
        ctx.setFillColor(white)
        ctx.fillEllipse(in: shineRect)

        // Small white shine (bottom-right)
        let shine2R: CGFloat = 0.008
        let shine2Rect = CGRect(
            x: x(ex + 0.012 - shine2R),
            y: x(eyeY + 0.014 - shine2R),
            width: x(shine2R * 2),
            height: x(shine2R * 2)
        )
        ctx.setFillColor(white)
        ctx.fillEllipse(in: shine2Rect)
    }

    // ============================================
    // NOSTRILS — two tiny dots on the snout
    // ============================================
    let nostrilR: CGFloat = 0.006
    for nx in [0.47 as CGFloat, 0.53 as CGFloat] {
        let nRect = CGRect(x: x(nx - nostrilR), y: x(0.44 - nostrilR), width: x(nostrilR * 2), height: x(nostrilR * 2))
        ctx.setFillColor(mintDark)
        ctx.fillEllipse(in: nRect)
    }

    // ============================================
    // MOUTH — tiny gentle smile
    // ============================================
    let smile = CGMutablePath()
    smile.move(to: pt(0.47, 0.47))
    smile.addQuadCurve(to: pt(0.53, 0.47), control: pt(0.50, 0.50))
    ctx.addPath(smile)
    ctx.setStrokeColor(mintDark)
    ctx.setLineWidth(x(0.006))
    ctx.setLineCap(.round)
    ctx.strokePath()

    // ============================================
    // CHEEKS — subtle warm blush
    // ============================================
    let cheekColor = CGColor(red: 1.0, green: 0.65, blue: 0.72, alpha: 0.35)
    let cheekR: CGFloat = 0.030
    for cx in [0.36 as CGFloat, 0.64 as CGFloat] {
        let cheekRect = CGRect(x: x(cx - cheekR), y: x(0.43 - cheekR * 0.7), width: x(cheekR * 2), height: x(cheekR * 1.4))
        ctx.setFillColor(cheekColor)
        ctx.fillEllipse(in: cheekRect)
    }

    return ctx.makeImage()
}

func savePNG(_ image: CGImage, to url: URL) {
    guard let dest = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil) else { return }
    CGImageDestinationAddImage(dest, image, nil)
    CGImageDestinationFinalize(dest)
}

let sizes: [(Int, String)] = [
    (16, "icon_16x16.png"), (32, "icon_16x16@2x.png"),
    (32, "icon_32x32.png"), (64, "icon_32x32@2x.png"),
    (128, "icon_128x128.png"), (256, "icon_128x128@2x.png"),
    (256, "icon_256x256.png"), (512, "icon_256x256@2x.png"),
    (512, "icon_512x512.png"), (1024, "icon_512x512@2x.png"),
]

let outDir = URL(fileURLWithPath: CommandLine.arguments[1])
try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)

for (size, name) in sizes {
    guard let img = drawIcon(size: size) else { continue }
    savePNG(img, to: outDir.appendingPathComponent(name))
    print("✓ \(name)")
}
