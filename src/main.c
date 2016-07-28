#include <pebble.h>
#include "MainWindow.h"

int main() {
	
	// Show the main window and listen to user input
	MainWindow_Show();
	MainWindow_Listen();
	
	// App loop
	app_event_loop();
	
	// Deinit
	MainWindow_Close();
	
}