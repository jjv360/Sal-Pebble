#pragma once
#include <pebble.h>



// Class
typedef struct {
	
	// Vars
	Layer* layer;
	int framerate;
	int32_t timeOffset;
	AppTimer* nextFrameTimer;
	bool animate;
	
} SalIcon;



// Constructor, call to create a new instance of SalIcon
SalIcon* SalIcon_Create(GRect frame);

// Destructor, call to destroy the specified instance of SalIcon, removing it from the screen if necessary
void SalIcon_Destroy(SalIcon* icon);

// Gets the actual layer object
Layer* SalIcon_GetLayer(SalIcon* icon);

// Sets if the icon should animate
void SalIcon_SetAnimated(SalIcon* icon, bool animate);