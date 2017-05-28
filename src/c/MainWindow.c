#include <pebble.h>
#include "MainWindow.h"
#include "SalIcon.h"
#include "OutputTextLabel.h"

#define MIN(a, b)		(a < b ? a : b)
#define MAX(a, b)		(a > b ? a : b)

static Window* window = 0;
static OutputTextLabel* outputLabel = 0;
static SalIcon* salIcon = 0;
static TextLayer* statusLbl = 0;
static char statusLblBfr[256] = {0};

static void onWindowLoad(Window* window) {
	
	// Get information about the Window
	Layer* window_layer = window_get_root_layer(window);
	GRect bounds = layer_get_bounds(window_layer);
	
	// Setup window
	window_set_background_color(window, GColorBlack);
	
	// Create sal output label
	outputLabel = OutputTextLabel_Create(GRect(10, 60, bounds.size.w - 20, bounds.size.h - 70));
	layer_add_child(window_layer, OutputTextLabel_GetLayer(outputLabel));
	
	// Set output label fonts
	OutputTextLabel_SetFonts(outputLabel, 
							 fonts_get_system_font(FONT_KEY_BITHAM_42_LIGHT),
							 fonts_get_system_font(FONT_KEY_GOTHIC_28),
							 fonts_get_system_font(FONT_KEY_GOTHIC_24),
							 fonts_get_system_font(FONT_KEY_GOTHIC_14)
	);
	
	// Create Sal icon
	salIcon = SalIcon_Create(bounds);
	layer_add_child(window_layer, SalIcon_GetLayer(salIcon));
	
	// Create status label
	statusLbl = text_layer_create(GRect(0, bounds.size.h - 18, bounds.size.w, 18));
	text_layer_set_background_color(statusLbl, GColorClear);
	text_layer_set_overflow_mode(statusLbl, GTextOverflowModeFill);
	text_layer_set_font(statusLbl, fonts_get_system_font(FONT_KEY_GOTHIC_14));
	text_layer_set_text_alignment(statusLbl, GTextAlignmentCenter);
	text_layer_set_text_color(statusLbl, GColorLightGray);
	text_layer_set_text(statusLbl, "");
	layer_add_child(window_layer, text_layer_get_layer(statusLbl));
	
}

static void onWindowUnload(Window* window) {
	
	// Remove sal output label
	OutputTextLabel_Destroy(outputLabel);
	outputLabel = 0;
	
	// Remove Sal icon
	SalIcon_Destroy(salIcon);
	salIcon = 0;
	
}

static void onButtonDown(ClickRecognizerRef recognizer, void *context) {
	
	// User pressed a button, start listening for input again
	MainWindow_Listen();
	
}

static void onSetupClickConfig(void* ctx) {
	
	// Check if got window
	if (window == 0)
		return;
	
	// Setup button listeners
	window_raw_click_subscribe(BUTTON_ID_UP, onButtonDown, 0, 0);
	window_raw_click_subscribe(BUTTON_ID_SELECT, onButtonDown, 0, 0);
	window_raw_click_subscribe(BUTTON_ID_DOWN, onButtonDown, 0, 0);
	
}

/*static void onAccelerometerTap(AccelAxisType axis, int32_t direction) {
	
	// Check direction of tap
	if (axis != ACCEL_AXIS_Z)
		return;
	
	// Tapped, start listening
	MainWindow_Listen();
	
}*/

static void onAppMessageOutboxFailed(DictionaryIterator *iterator, AppMessageResult reason, void *context) {
	MainWindow_SetOutputText("There was a problem sending data to your phone...");
}

#define APPMSG_BUFFER_SIZE 4096
static void onAppMessageReceived(DictionaryIterator* iterator, void *context) {
	
	// Get action
	Tuple* action = dict_find(iterator, MESSAGE_KEY_action);
	if (!action)
		return;
	
	// Check action
	if (strcmp(action->value->cstring, "output-text") == 0) {
		
		// Get text
		Tuple* text = dict_find(iterator, MESSAGE_KEY_text);
		if (!text)
			return;
		
		// Display the provided text
		MainWindow_SetOutputText(text->value->cstring);
		
		// Do a quick vibration
		vibes_short_pulse();
		
		// Turn on screen light momentarily
		light_enable_interaction();
		
	} else if (strcmp(action->value->cstring, "status") == 0) {
		
		// Get text
		Tuple* text = dict_find(iterator, MESSAGE_KEY_text);
		if (!text)
			return;
		
		// Display status
		MainWindow_UpdateStatus(text->value->cstring);
		
	}
	
}

void MainWindow_Show() {
	
	// Check if window exists
	if (window != 0)
		window_destroy(window);
	
	// Create window
	window = window_create();

	// Set event handlers
	window_set_window_handlers(window, (WindowHandlers) {
		.load = onWindowLoad,
		.unload = onWindowUnload
	});
	
	// Set click config provider
	window_set_click_config_provider(window, onSetupClickConfig);
	
	// Add to window stack
	window_stack_push(window, true);
	
	// Detect taps from the accelerometer
	//accel_tap_service_subscribe(onAccelerometerTap);
	
	// Connect to the app message system
	app_message_register_outbox_failed(onAppMessageOutboxFailed);
	app_message_register_inbox_received(onAppMessageReceived);
	app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());
	
	// Set icon fullscreen
	MainWindow_SetIconFullscreen();
	
}

void MainWindow_Close() {
	
	// Check if closed already
	if (window == 0)
		return;
	
	// Destroy window
	window_destroy(window);
	window = 0;
	
}

static bool isHidingText = false;
void MainWindow_SetOutputText(const char* txt) {
	
	// Check if no output label
	if (outputLabel == 0)
		return;
	
	// Set output label's text
	OutputTextLabel_SetText(outputLabel, txt);
	
	// If hiding text, animate view back
	if (isHidingText) {
		
		// Stop animating Sal icon
		SalIcon_SetAnimated(salIcon, false);
		
		// Get information about the Window
		Layer* window_layer = window_get_root_layer(window);
		GRect bounds = layer_get_bounds(window_layer);

		// Hide activity, move icon view back
		GRect targetFrame = GRect(0, 0, bounds.size.w, 60);
		PropertyAnimation* propertyAnimation = property_animation_create_layer_frame(SalIcon_GetLayer(salIcon), 0, &targetFrame);
		Animation* animation = property_animation_get_animation(propertyAnimation);
		animation_set_duration(animation, 250);
		animation_schedule(animation);
		
		// No longer hiding text
		isHidingText = false;
		
	}
	
}

static DictationSession* dictationSession = 0;
static bool isListening = false;
void MainWindow_Listen() {
	
	// Ignore if already listening
	if (isListening)
		return;
	
	// Create dictation session if needed
	if (dictationSession == 0)
		dictationSession = dictation_session_create(0, MainWindow_DictationCallback, 0);
	if (dictationSession == 0) {
		
		// Failed, maybe the phone app is not connected or the watch doesn't have a microphone etc...
		MainWindow_SetOutputText("Sorry, I'm unable to connect to your microphone...");
		return;
		
	}
	
	// Set session info
	dictation_session_enable_confirmation(dictationSession, false);
	dictation_session_enable_error_dialogs(dictationSession, false);
	
	// Start dictation
	isListening = true;
	//MainWindow_SetOutputText("...");
	dictation_session_start(dictationSession);
	
}

void MainWindow_DictationCallback(DictationSession* session, DictationSessionStatus status, char* transcription, void* context) {
	
	// Finished listening
	isListening = false;
	
	// Check session status
	if (status == DictationSessionStatusFailureSystemAborted)
		return;
	else if (status == DictationSessionStatusFailureNoSpeechDetected)
		transcription = "event:speech:nothing-detected";
	else if (status == DictationSessionStatusFailureConnectivityError)
		return MainWindow_SetOutputText("Sorry, it seems there is no network connection right now...");
	else if (status == DictationSessionStatusFailureDisabled)
		transcription = "event:speech:device-access-disabled";
	else if (status != DictationSessionStatusSuccess)
		transcription = "event:speech:unknown-error";
		
	// Send text to phone app
	MainWindow_ProcessText(transcription);
	
}

// Continually sends a ping to the phone to check if Sal has processed the response yet
/*static void MainWindow_SendPing(void* data) {
	
	// Only do if waiting for result
	if (!isHidingText)
		return;
	
	// Register timer to do this again soon
	app_timer_register(2 * 1000, MainWindow_SendPing, 0);
	
	// Open the outbox
	DictionaryIterator* dict = 0;
	AppMessageResult res = app_message_outbox_begin(&dict);
	if (res != APP_MSG_OK)
		return;
	
	// Create dictionary
	dict_write_cstring(dict, DICT_ACTION, "fetch-data");
	
	// Send to dictionary to the phone app
	res = app_message_outbox_send();
	if (res != APP_MSG_OK)
		return;
	
}*/

void MainWindow_SetIconFullscreen() {
	
	// Get information about the Window
	Layer* window_layer = window_get_root_layer(window);
	GRect bounds = layer_get_bounds(window_layer);
	
	// Clear text and resize
	OutputTextLabel_SetText(outputLabel, "");
	layer_set_frame(SalIcon_GetLayer(salIcon), GRect(0, 30, bounds.size.w, bounds.size.h - 60));
	isHidingText = true;
	
}

void MainWindow_ProcessText(const char* text) {
		
	// Show activity, move icon view to fill the screen
	MainWindow_SetIconFullscreen();
		
	// Start animating Sal icon
	SalIcon_SetAnimated(salIcon, true);
	
	// Open the outbox
	DictionaryIterator* dict = 0;
	AppMessageResult res = app_message_outbox_begin(&dict);
	if (res != APP_MSG_OK)
		return MainWindow_SetOutputText("Sorry, there was a problem connecting to your phone...");
	
	// Create dictionary
	dict_write_cstring(dict, MESSAGE_KEY_action, "process-text");
	dict_write_cstring(dict, MESSAGE_KEY_text, text);
	
	// Send to dictionary to the phone app
	res = app_message_outbox_send();
	if (res != APP_MSG_OK)
		return MainWindow_SetOutputText("Sorry, there was a problem connecting to your phone...");
	
	// Continually send a ping to the phone until data is received
	//MainWindow_SendPing(0);
	
}


// ============================================================ Status label

static AppTimer* statusClearTimer = 0;

void MainWindow_ClearStatus(void* data) {
	text_layer_set_text(statusLbl, "");
	statusClearTimer = 0;
}

void MainWindow_UpdateStatus(const char* text) {
	
	// Copy text into buffer
	strncpy(statusLblBfr, text, 256 - 1);
	
	// Set text
	text_layer_set_text(statusLbl, statusLblBfr);
	
	// Register timer to do this again soon
	if (statusClearTimer) app_timer_cancel(statusClearTimer);
	statusClearTimer = app_timer_register(7 * 1000, MainWindow_ClearStatus, 0);
	
}