#include <pebble.h>
#include "SalIcon.h"

#ifndef MIN
#define MIN(a, b)		((a) < (b) ? (a) : (b))
#endif

// @private Called to redraw the layer
static void SalIcon_Redraw(struct Layer* layer, GContext* ctx) {
	
	// Get class container
	SalIcon* icon = layer_get_data(layer);
	
	// Get window bounds
	GRect bounds = layer_get_bounds(layer);
	int centerX = bounds.size.w / 2;
	int centerY = bounds.size.h / 2;
	int outerRadius = MIN(bounds.size.w - 20, bounds.size.h - 20) / 2;
	int innerRadius = outerRadius - 15;
	
	// Make inner circle pulse
	if (icon->animate)
		innerRadius += sin_lookup(icon->timeOffset * TRIG_MAX_ANGLE / 3000) * 4 / TRIG_MAX_RATIO;
	
	// Clear view
	graphics_context_set_fill_color(ctx, GColorBlack);
	graphics_fill_rect(ctx, bounds, 0, 0);
	
	// Draw outer circle
	graphics_context_set_stroke_color(ctx, GColorVividCerulean);
	graphics_context_set_stroke_width(ctx, 3);
	graphics_draw_circle(ctx, GPoint(centerX, centerY), outerRadius);
	
	// Draww inner circle
	graphics_context_set_fill_color(ctx, GColorVividCerulean);
	graphics_fill_circle(ctx, GPoint(centerX, centerY), innerRadius);
	
}

// @private Called every frame
void SalIcon_AppTimerTick(SalIcon* icon) {
	
	// Update view
	icon->nextFrameTimer = 0;
	layer_mark_dirty(icon->layer);
	
	// Increase frame count
	icon->timeOffset += 1000 / icon->framerate;
	
	// Register next frame if animating
	if (icon->animate)
		icon->nextFrameTimer = app_timer_register(1000 / icon->framerate, (AppTimerCallback) SalIcon_AppTimerTick, icon);
	
}

// Constructor
SalIcon* SalIcon_Create(GRect frame) {
	
	// Create layer
	Layer* layer = layer_create_with_data(frame, sizeof(SalIcon));
	
	// Get pointer to our main class container and initialize it
	SalIcon* salIcon = layer_get_data(layer);
	memset(salIcon, 0, sizeof(SalIcon));
	
	// Set defaults
	salIcon->framerate = 15;
	salIcon->animate = true;
	
	// Store layer
	salIcon->layer = layer;
	
	// Setup layer
	layer_set_update_proc(layer, SalIcon_Redraw);
	
	// Do first render loop
	SalIcon_AppTimerTick(salIcon);
	
	// Done
	return salIcon;
	
}

// Destructor
void SalIcon_Destroy(SalIcon* icon) {
	
	// Check for null
	if (icon == 0)
		return;
	
	// Remove timer
	if (icon->nextFrameTimer)
		app_timer_cancel(icon->nextFrameTimer);
	
	// Destroy layer (which will also free the class container memory)
	layer_destroy(icon->layer);
	
}

// Get layer
Layer* SalIcon_GetLayer(SalIcon* icon) {
	return icon->layer;
}

// Set animated
void SalIcon_SetAnimated(SalIcon* icon, bool animate) {
	
	// Check for null
	if (icon == 0)
		return;
	
	// Check for change
	if (animate == icon->animate)
		return;
	
	// Set animate
	icon->animate = animate;
	
	// Redraw
	SalIcon_AppTimerTick(icon);
	
}