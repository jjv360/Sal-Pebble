#pragma once
#include <pebble.h>


// Class
typedef struct {
	
	// Fonts
	GFont giantFont;
	GFont largeFont;
	GFont mediumFont;
	GFont smallFont;
	bool shouldDestroyFonts;
	
	// Vars
	Layer* layer;
	char text[256];
	
} OutputTextLabel;


// Constructor, call to create a new instance
OutputTextLabel* OutputTextLabel_Create(GRect frame);

// Destructor, call to destroy the specified instance, removing it from the screen if necessary
void OutputTextLabel_Destroy(OutputTextLabel* label);

// Gets the actual layer object
Layer* OutputTextLabel_GetLayer(OutputTextLabel* label);

// Set fonts to use. The large font will be used if the text can fit, and if not then the small font will be used.
void OutputTextLabel_SetFonts(OutputTextLabel* label, GFont giantFont, GFont largeFont, GFont mediumFont, GFont smallFont);

// Set the text to display. The text is copied into an internal buffer, so modifications to the string after calling this function have no effect.
void OutputTextLabel_SetText(OutputTextLabel* label, const char* text);