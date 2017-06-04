#pragma once
#include <pebble.h>

void MainWindow_Show();
void MainWindow_Close();
void MainWindow_Listen();
void MainWindow_SetOutputText(const char* text);
void MainWindow_ProcessText(const char* text);
void MainWindow_UpdateStatus(const char* text);
void MainWindow_SetIconFullscreen();
void MainWindow_SetAwake();

// Private functions
void MainWindow_DictationCallback(DictationSession* session, DictationSessionStatus status, char* transcription, void* context);
void MainWindow_WakePhoneTimerCallback(void* data);