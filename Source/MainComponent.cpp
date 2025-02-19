#include "MainComponent.h"


//==============================================================================
MainComponent::MainComponent()
{
    // Make sure you set the size of the component after
    // you add any child components.
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
    // This function will be called when the audio device is started, or when
    // its settings (i.e. sample rate, block size, etc) are changed.

    // You can use this function to initialise any resources you might need,
    // but be careful - it will be called on the audio thread, not the GUI thread.

    // For more details, see the help for AudioProcessor::prepareToPlay()
}

void MainComponent::getNextAudioBlock (const juce::AudioSourceChannelInfo& bufferToFill)
{
    // Your audio-processing code goes here!

    // For more details, see the help for AudioProcessor::getNextAudioBlock()

    // Right now we are not producing any data, in which case we need to clear the buffer
    // (to prevent the output of random noise)
    bufferToFill.clearActiveBufferRegion();
}

void MainComponent::releaseResources()
{
    // This will be called when the audio device stops, or when it is being
    // restarted due to a setting change.

    // For more details, see the help for AudioProcessor::releaseResources()
}

//==============================================================================
void MainComponent::paint (juce::Graphics& g)
{
    // (Our component is opaque, so we must completely fill the background with a solid colour)
    g.fillAll(juce::Colours::peachpuff);
    g.drawImage(puffle, 0, 0, 75, 75, 0, 0, puffle.getWidth(), puffle.getHeight());

    // You can add your drawing code here!
}

void MainComponent::resized()
{
    keyLogger.setBounds(getLocalBounds());
    // This is called when the MainContentComponent is resized.
    // If you add any child components, this is where you should
    // update their positions.
}
