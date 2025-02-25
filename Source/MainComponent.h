#pragma once

#include <JuceHeader.h>
#include <ApplicationServices/ApplicationServices.h>


// i changed it to label because label is inhereting from component and allows for text creation
class oscSend {
public:
    void sendOSCMessage(const juce::String& address, int val){
        juce::OSCMessage msg(address);
        msg.addInt32(val);
        
        if(!sender.send(msg)){
            DBG("error message not sent.");
        }
    }
    juce::OSCSender sender;
private:
};

class GlobalKeyLogger : public juce::Label{
public:
    GlobalKeyLogger() {
        // Create an event tap to listen for key events
        eventTap = CGEventTapCreate(
            kCGSessionEventTap, // Tap at the session level (global)
            kCGHeadInsertEventTap,
            kCGEventTapOptionDefault,
            CGEventMaskBit(kCGEventKeyDown),
            eventTapCallback,
            this // using 'this' as refcon allows for component modification during static hardware interaction.
        );

        if (!eventTap) {
            setText("_keypress is unable to record. please ensure accessibility permissions are enabled.", juce::NotificationType::dontSendNotification);
            juce::Logger::writeToLog("Failed to create event tap. Ensure accessibility permissions are enabled.");
            return;
        }

        runLoopSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, eventTap, 0);
        CFRunLoopAddSource(CFRunLoopGetCurrent(), runLoopSource, kCFRunLoopCommonModes);
        CGEventTapEnable(eventTap, true);
        setColour(juce::Label::ColourIds::textColourId, juce::Colours::black);
        setText("logger started", juce::NotificationType::dontSendNotification);
        juce::Logger::writeToLog("Global key logger started.");
    }

    ~GlobalKeyLogger() {
        if (eventTap) {
            CGEventTapEnable(eventTap, false);
            CFRelease(eventTap);
        }
        if (runLoopSource) {
            CFRunLoopRemoveSource(CFRunLoopGetCurrent(), runLoopSource, kCFRunLoopCommonModes);
            CFRelease(runLoopSource);
        }
    }
    
    oscSend testSender;
    juce::Colour bg;

private:
    
    //
    //
    
    CFMachPortRef eventTap = nullptr;
    CFRunLoopSourceRef runLoopSource = nullptr;

    // must look into cgeventref... this is so cool
    // requires more admin access than the regular programs but can create awesome stuff.
    static CGEventRef eventTapCallback(CGEventTapProxy proxy, CGEventType type, CGEventRef event, void* refcon) {
        // this does not make sense to me...
        //
        auto* component = static_cast<GlobalKeyLogger*>(refcon);
        //
        if (type == kCGEventKeyDown) {
            // Get the key code
            CGKeyCode keyCode = (CGKeyCode)CGEventGetIntegerValueField(event, kCGKeyboardEventKeycode);
            juce::Logger::writeToLog("Key pressed: " + juce::String(keyCode));
            std::cout << juce::String(keyCode) << std::endl;
            juce::String code = juce::String(keyCode);
            int intCode = keyCode;
            component->setText("key :" + juce::String(keyCode), juce::NotificationType::dontSendNotification);
            component->testSender.sendOSCMessage("/test", intCode);
            component->bg = juce::Colour(std::rand(),std::rand(),std::rand());
        }
        return event;
    }
    

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(GlobalKeyLogger)
};

//==============================================================================
/*
    This component lives inside our window, and this is where you should put all
    your controls and content.
*/
class MainComponent  : public juce::AudioAppComponent, public juce::Timer
{
public:
    //==============================================================================
    MainComponent();
    ~MainComponent() override;

    //==============================================================================
    void prepareToPlay (int samplesPerBlockExpected, double sampleRate) override;
    void getNextAudioBlock (const juce::AudioSourceChannelInfo& bufferToFill) override;
    void releaseResources() override;

    //==============================================================================
    void paint (juce::Graphics& g) override;
    void resized() override;
    
    void updatePuffle(){
        switch(puffle_case){
            case 0:
                puffle = juce::ImageCache::getFromMemory(BinaryData::pf_1_png, BinaryData::pf_1_pngSize);
                repaint();
                break;
            case 1:
                puffle = juce::ImageCache::getFromMemory(BinaryData::pf_2_png, BinaryData::pf_2_pngSize);
                repaint();
                break;
            case 2:
                puffle = juce::ImageCache::getFromMemory(BinaryData::pf_3_png, BinaryData::pf_3_pngSize);
                repaint();
                break;
            case 3:
                puffle = juce::ImageCache::getFromMemory(BinaryData::pf_4_png, BinaryData::pf_4_pngSize);
                repaint();
                break;
            case 4:
                puffle = juce::ImageCache::getFromMemory(BinaryData::pf_5_png, BinaryData::pf_5_pngSize);
                repaint();
                break;
            case 5:
                puffle = juce::ImageCache::getFromMemory(BinaryData::pf_6_png, BinaryData::pf_6_pngSize);
                repaint();
                break;
            case 6:
                puffle = juce::ImageCache::getFromMemory(BinaryData::pf_7_png, BinaryData::pf_7_pngSize);
                repaint();
                break;
            case 7:
                puffle = juce::ImageCache::getFromMemory(BinaryData::pf_8_png, BinaryData::pf_8_pngSize);
                repaint();
                break;
            case 8:
                puffle = juce::ImageCache::getFromMemory(BinaryData::pf_9_png, BinaryData::pf_9_pngSize);
                repaint();
                break;
            case 9:
                puffle = juce::ImageCache::getFromMemory(BinaryData::pf_10_png, BinaryData::pf_10_pngSize);
                repaint();
                break;
            case 10:
                puffle = juce::ImageCache::getFromMemory(BinaryData::pf_11_png, BinaryData::pf_11_pngSize);
                repaint();
                break;
        }
        puffle_case++;
        if(puffle_case > 10){
            puffle_case = 0;
        }
    }
    
    //
    void timerCallback() override {
        updatePuffle();
    }
    

private:
    
    juce::TextEditor test;
    
    GlobalKeyLogger keyLogger;
    
    juce::Image puffle;
    int puffle_case = 0;
    //==============================================================================
    // Your private member variables go here...


    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (MainComponent)
};
