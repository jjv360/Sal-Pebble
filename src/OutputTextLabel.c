#include <pebble.h>
#include "OutputTextLabel.h"

#ifndef MIN
#define MIN(a, b)		((a) < (b) ? (a) : (b))
#endif

#ifndef MAX
#define MAX(a, b)		((a) > (b) ? (a) : (b))
#endif

// @private Called to redraw the layer
static void OutputTextLabel_Redraw(struct Layer* layer, GContext* ctx) {
	
	// Get class container
	OutputTextLabel* label = layer_get_data(layer);
	
	// Get window bounds
	GRect bounds = layer_get_bounds(layer);
	
	// Clear the view area
	graphics_context_set_fill_color(ctx, GColorBlack);
	graphics_fill_rect(ctx, bounds, 0, 0);
	
	// Check if got text
	if (strlen(label->text) == 0)
		return;
	
	// Check if can use giant font
	if (label->giantFont) {
		
		// Get bounds of text
		GSize textSize = graphics_text_layout_get_content_size(label->text, label->giantFont, bounds, GTextOverflowModeWordWrap, GTextAlignmentCenter);
		if (textSize.h < bounds.size.h) {
			
			// We can use the large font, draw it!
			graphics_context_set_stroke_color(ctx, GColorWhite);
			graphics_draw_text(ctx, label->text, label->giantFont, GRect(0, bounds.size.h / 2 - textSize.h / 2, bounds.size.w, bounds.size.h), GTextOverflowModeWordWrap, GTextAlignmentCenter, 0);
			return;
			
		}
		
	}
	
	// Check if can use large font
	if (label->largeFont) {
		
		// Get bounds of text
		GSize textSize = graphics_text_layout_get_content_size(label->text, label->largeFont, bounds, GTextOverflowModeWordWrap, GTextAlignmentCenter);
		if (textSize.h < bounds.size.h) {
			
			// We can use the large font, draw it!
			graphics_context_set_stroke_color(ctx, GColorWhite);
			graphics_draw_text(ctx, label->text, label->largeFont, GRect(0, bounds.size.h / 2 - textSize.h / 2, bounds.size.w, bounds.size.h), GTextOverflowModeWordWrap, GTextAlignmentCenter, 0);
			return;
			
		}
		
	}
	
	// Check if can use medium font
	if (label->mediumFont) {
		
		// Get bounds of text
		GSize textSize = graphics_text_layout_get_content_size(label->text, label->mediumFont, bounds, GTextOverflowModeWordWrap, GTextAlignmentCenter);
		if (textSize.h < bounds.size.h) {
			
			// We can use the large font, draw it!
			graphics_context_set_stroke_color(ctx, GColorWhite);
			graphics_draw_text(ctx, label->text, label->mediumFont, GRect(0, bounds.size.h / 2 - textSize.h / 2, bounds.size.w, bounds.size.h), GTextOverflowModeWordWrap, GTextAlignmentCenter, 0);
			return;
			
		}
		
	}
	
	// Check if can use small font
	if (label->smallFont) {
		
		// Get bounds of text
		GSize textSize = graphics_text_layout_get_content_size(label->text, label->smallFont, bounds, GTextOverflowModeWordWrap, GTextAlignmentCenter);
		
		// Draw it no matter the size
		graphics_context_set_stroke_color(ctx, GColorWhite);
		graphics_draw_text(ctx, label->text, label->smallFont, GRect(0, MAX(bounds.size.h / 2 - textSize.h / 2, 0), bounds.size.w, bounds.size.h), GTextOverflowModeWordWrap, GTextAlignmentCenter, 0);
		return;
		
	}
	
}

// Constructor
OutputTextLabel* OutputTextLabel_Create(GRect frame) {
	
	// Create layer
	Layer* layer = layer_create_with_data(frame, sizeof(OutputTextLabel));
	
	// Get pointer to our main class container and initialize it
	OutputTextLabel* label = layer_get_data(layer);
	memset(label, 0, sizeof(OutputTextLabel));
	
	// Store layer
	label->layer = layer;
	
	// Setup layer
	layer_set_update_proc(layer, OutputTextLabel_Redraw);
	
	// Done
	return label;
	
}

// Destructor
void OutputTextLabel_Destroy(OutputTextLabel* label) {
	
	// Check for null
	if (label == 0)
		return;
	
	// Destroy layer (which will also free the class container memory)
	layer_destroy(label->layer);
	
}

// Get layer
Layer* OutputTextLabel_GetLayer(OutputTextLabel* label) {
	return label->layer;
}

// Set fonts
void OutputTextLabel_SetFonts(OutputTextLabel* label, GFont giantFont, GFont largeFont, GFont mediumFont, GFont smallFont) {
	
	// Check for null
	if (label == 0)
		return;
	
	// Store fonts
	label->giantFont = giantFont;
	label->largeFont = largeFont;
	label->mediumFont = mediumFont;
	label->smallFont = smallFont;
	
	// Mark layer needs redraw
	layer_mark_dirty(label->layer);
	
}

// Set text to display
void OutputTextLabel_SetText(OutputTextLabel* label, const char* text) {
	
	// Check for null
	if (label == 0)
		return;
	
	// Copy text into buffer
	strncpy(label->text, text, 256 - 1);
	
	// Mark layer needs redraw
	layer_mark_dirty(label->layer);
	
}