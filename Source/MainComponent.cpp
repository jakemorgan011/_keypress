#include "MainComponent.h"


//==============================================================================
MainComponent::MainComponent()
{
    if(keyLogger.testSender.sender.connect("127.0.0.1", 7000)){
        DBG("error not connecting");
    }
    
    keyLogger.testSender.sendOSCMessage("/test", 123);
    
    
    startTimer(85);
    setSize (75, 75);
    
    keyLogger.setEnabled(true);
    keyLogger.setAlpha(1);
    addAndMakeVisible(keyLogger);
    
    test.setEnabled(true);
    test.setMultiLine(true);
    test.setOpaque(false);
    test.setAlpha(0.5);
    test.setReturnKeyStartsNewLine(false);
    
    test.setColour(juce::TextEditor::ColourIds::backgroundColourId, juce::Colours::white);
    test.setColour(juce::TextEditor::ColourIds::textColourId, juce::Colours::black);
    test.setColour(juce::TextEditor::ColourIds::highlightColourId, juce::Colours::red);
    test.setColour(juce::TextEditor::ColourIds::highlightedTextColourId, juce::Colours::white);
    test.setColour(juce::TextEditor::ColourIds::focusedOutlineColourId, juce::Colours::red);
    test.setColour(juce::TextEditor::ColourIds::outlineColourId, juce::Colours::black);

    // Some platforms require permissions to open input channels so request that here
    if (juce::RuntimePermissions::isRequired (juce::RuntimePermissions::recordAudio)
        && ! juce::RuntimePermissions::isGranted (juce::RuntimePermissions::recordAudio))
    {
        juce::RuntimePermissions::request (juce::RuntimePermissions::recordAudio,
                                           [&] (bool granted) { setAudioChannels (granted ? 2 : 0, 2); });
    }
    else
    {
        // Specify the number of input and output channels that we want to open
        setAudioChannels (2, 2);
    }
    
}

MainComponent::~MainComponent()
{
    // This shuts down the audio device and clears the audio source.
    shutdownAudio();
}

//==============================================================================
void MainComponent::prepareToPlay (int samplesPerBlockExpected, double sampleRate)
{
}

void MainComponent::getNextAudioBlock (const juce::AudioSourceChannelInfo& bufferToFill)
{
    bufferToFill.clearActiveBufferRegion();
}

void MainComponent::releaseResources()
{

}

//==============================================================================
void MainComponent::paint (juce::Graphics& g)
{
    g.fillAll(juce::Colours::peachpuff);
    g.fillAll(keyLogger.bg);
    g.drawImage(puffle, 0, 0, 75, 75, 0, 0, puffle.getWidth(), puffle.getHeight());
}

void MainComponent::resized()
{
    keyLogger.setBounds(getLocalBounds().removeFromLeft(50));
}
