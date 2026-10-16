# -*- coding: utf-8 -*-
"""PlastiBioFuel design tokens, shared by the docx and pdf renderers."""
BLUE     = "045AA9"
BLUE_DK  = "023A6E"
BLUE_LT  = "9EC8F0"
GHOST    = "D7E6F5"
PINK     = "D50057"
PINK_BG  = "FDF0F5"
TINT     = "F2F7FC"
INK      = "2A2A2A"
SOFT     = "4A5561"
MUTED    = "6B7684"
FAINT    = "98A2AE"
RULE     = "E3E8EF"
RULE_LT  = "EDF1F5"
AMBER    = "7A6410"
AMBER_BG = "FBF4DF"
TEAL     = "0F766E"
TEAL_BG  = "E6F4F1"
GREY_BG  = "F1F3F5"

# docx fonts (house style)
DOC_DISP = "Aptos Display"
DOC_DISP_FB = "Calibri"
DOC_BODY = "Aptos"
DOC_BODY_FB = "Calibri"

PILLS = {
  "confirmed":   ("CONFIRMED",      BLUE,  "E8F1FA"),
  "anticipated": ("ANTICIPATED",    AMBER, AMBER_BG),
  "na":          ("NOT APPLICABLE", MUTED, GREY_BG),
  "required":    ("REQUIRED",       PINK,  PINK_BG),
  "optional":    ("OPTIONAL",       MUTED, GREY_BG),
  "ready":       ("READY",          TEAL,  TEAL_BG),
}
