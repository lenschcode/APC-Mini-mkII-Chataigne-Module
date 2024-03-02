var faderNotes = [ 48, 49, 50, 51, 52, 53, 54, 55, 56]; //CC
var buttonNotes = [
	[56, 57, 58, 59, 60, 61, 62, 63],
	[48, 49, 50, 51, 52, 53, 54, 55],
	[40, 41, 42, 43, 44, 45, 46, 47],
	[32, 33, 34, 35, 36, 37, 38, 39],
	[24, 25, 26, 27, 28, 29, 30, 31],
	[16, 17, 18, 19, 20, 21, 22, 23],
	[ 8, 9, 10, 11, 12, 13, 14, 15],
	[ 0, 1, 2, 3, 4, 5, 6, 7],
]; // Notes
var sideButtonNotes = [112, 113, 114, 115, 116, 117, 118, 119];
var bottomButtonNotes = [100, 101, 102, 103, 104, 105, 106, 107, 122];

var buttonValueObj = [];
var colorParameterObj = [];
var pulsingParameterObj = [];

var pulsingSteps = 128;
var pulsingTable = [0, 13, 26, 40, 53, 67, 80, 93, 107, 120, 134, 147, 161, 174, 187, 201, 214, 228, 255, 255, 252, 250, 247, 245, 243, 240, 238, 236, 233, 231, 229, 226, 224, 222, 219, 217, 215, 212, 210, 208, 205, 203, 201, 198, 196, 194, 191, 189, 187, 184, 182, 180, 177, 175, 173, 170, 168, 166, 163, 161, 159, 156, 154, 152, 149, 147, 145, 142, 140, 138, 135, 133, 131, 128, 126, 123, 121, 119, 116, 114, 112, 109, 107, 105, 102, 100, 98, 95, 93, 91, 88, 86, 84, 81, 79, 77, 74, 72, 70, 67, 65, 63, 60, 58, 56, 53, 51, 49, 46, 44, 42, 39, 37, 35, 32, 30, 28, 25, 23, 21, 18, 16, 14, 11, 9, 7, 4, 0];
var pulsingRate = 1.0;
var previousStep = -1;



// ---- Midi Functions ----

function setMidiMode()
{
	local.sendSysex(0x00, 0x20, 0x29, 0x02, 0x0D, 0x0E, 0x01);
	script.log("Set Midi Mode with Sysex Message");
}


function setButtonColorBrightness(id, color, brightness)
{
	var noteStart = buttonNotes[id[0]][id[1]];
	var noteEnd = noteStart;

					// newColor[1] = Math.round((color[1] * intensity) / 255);
	var r = Math.round(((color[0] * 127) * brightness) / 255);
	var g = Math.round(((color[1] * 127) * brightness) / 255);
	var b = Math.round(((color[2] * 127) * brightness) / 255);

	script.log("Set Color for note " + note + " to rgb:{"+r+","+g+","+b+"} Intensity: "+brightness);
	local.sendSysex(0x47, 0x7F, 0x4F, 0x24, 0x00, 0x08, noteStart, noteEnd, r, r, g, g, b, b);
}


function setButtonColor(id, color)
{
	var note = buttonNotes[id[0]][id[1]];
	var r = Math.round(color[0] * 127);
	var g = Math.round(color[1] * 127);
	var b = Math.round(color[2] * 127);

	script.log("Set Color for note " + note + " to rgb:{"+r+","+g+","+b+"}");
	local.sendSysex(0x00, 0x20, 0x29, 0x02, 0x0D, 0x03, 0x03, note, r, g, b);
}



// ---- Helper Functions ----

function getButtonForNote(note) {
	for (var i = 0; i < 9; i++)
	{
		if (buttonNotes[i].contains(note))
		{
			return buttonValueObj[i][(buttonNotes[i].indexOf(note))];
		}
	}
	return null;
}


function getFaderForNote(note) {
	return faderNotes[i].indexOf(note)
}

function getColorParameterForNote(note) {
	for (var i = 0; i < 9; i++)
	{
		if (buttonNotes[i].contains(note))
		{
			return colorParameterObj[i][(buttonNotes[i].indexOf(note))];
		}
	}
	return null;
}


function getPulsingParameterForNote(note) {
	for (var i = 0; i < 9; i++)
	{
		if (buttonNotes[i].contains(note))
		{
			return pulsingParameterObj[i][(buttonNotes[i].indexOf(note))];
		}
	}
	return null;
}



// ---- User Commands ----

function resendColors()
{
	for(var i=0; i<9; i++)
	{
		for(var j=0; j<9; j++)
		{
			var color = colorParameterObj[i][j].get();
			setButtonColor([i,j], color);
		}
	}
}


function setColor(button, color)
{
	button.set(color);
}


function setColorByNote(note, color, pulsing)
{
	var colorObj = getColorParameterForNote(note);
	var pulsingObj = getPulsingParameterForNote(note);

	if (!!colorObj)
	{
		colorObj.set(color);
	}

	if (!!pulsingObj)
	{
		pulsingObj.set(pulsing);
	}

	script.log("Set Button with Note "+note+" to color "); //TODO
}

// ---- Module Common Functions ----

function init()
{
	script.log("Setting up Launchpad Mini mk3");

	// init variable
	for (var i = 0; i < 9; i++) 
	{
		buttonValueObj[i] = [];
		colorParameterObj[i] = [];
		pulsingParameterObj[i] = [];
	}

	// Logo
	colorParameterObj[0][8] = local.parameters.colors.logo.getChild("logo");
	pulsingParameterObj[0][8] = local.parameters.pulsing.logo.getChild("logo");

	// Top Buttons
    for (var i = 0; i < 8; i++) 
	{
        buttonValueObj[0][i] = local.values.getChild("Top Buttons").getChild("topButton" + (i + 1) + "");
        colorParameterObj[0][i] = local.parameters.colors.getChild("Top Buttons").getChild("topButton" + (i + 1) + "");
        pulsingParameterObj[0][i] = local.parameters.pulsing.getChild("Top Buttons").getChild("topButton" + (i + 1) + "");
    }

	// Main Buttons
    for (var i = 0; i < 8; i++) 
	{
		for (var j = 0; j < 8; j++) 
		{
			buttonValueObj[i+1][j] = local.values.getChild("Main Buttons").getChild("button" + (i + 1) + (j + 1) + "");
			colorParameterObj[i+1][j] = local.parameters.colors.getChild("Main Buttons").getChild("button" + (i + 1) + (j + 1) + "");
			pulsingParameterObj[i+1][j] = local.parameters.pulsing.getChild("Main Buttons").getChild("button" + (i + 1) + (j + 1) + "");
		}
    }

	// Side Buttons
    for (var i = 0; i < 8; i++) 
	{
        buttonValueObj[i+1][8] = local.values.getChild("Side Buttons").getChild("sideButton" + (i + 1));
        colorParameterObj[i+1][8] = local.parameters.colors.getChild("Side Buttons").getChild("sideButton" + (i + 1));
        pulsingParameterObj[i+1][8] = local.parameters.pulsing.getChild("Side Buttons").getChild("sideButton" + (i + 1));
    }

	// Setup Mode and Colors
	setMidiMode();
	resendColors();
}



function update(delta)
{
	var time = util.getTime(); // time in seconds
	var step = Math.round(((time % pulsingRate) / pulsingRate) * pulsingSteps);

	if (step !== previousStep)
	{
		var intensity = pulsingTable[step];
		script.log("Step: "+step+" intensity: "+intensity);

		for (var i = 0; i < 9; i ++)
		{
			for (var j = 0; j < 9; j ++)
			{
				if (pulsingParameterObj[i][j].get())
				{
					// scale color with intensity
					var color = colorParameterObj[i][j].get();
					// newColor[0] = Math.round((parseInt(color[0]) * intensity) / 255);
					// script.log("R: "+ parseInt(color[0]));
					// newColor[1] = Math.round((color[1] * intensity) / 255);
					// newColor[2] = Math.round((color[2] * intensity) / 255);
					setButtonColorBrightness([i,j], color, intensity);
				}
			}
		}
	}
	previousStep = step;
}



function moduleParameterChanged(param)
{
	// Debugging 
	script.log(param.name + " parameter changed, new value: " + param.get());

	// Connection
    if (param.name == "isConnected")
	{
        if (param.get() == 1)
		{
			util.delayThreadMS(3000);
			setMidiMode();
		} 
		resendColors();
    }


	// Color Feedback
	if(param.getParent().getParent().name == "colors")
	{
		var color = param.get();

		if(param.name == "logo")
		{
			var id = [0, 8];
			setButtonColor(id, color);
		}
		else if(param.getParent().name == "topButtons")
		{
			var id = [0, (parseInt(param.name.charAt(9))-1)];
			setButtonColor(id, color);
		}
		else if(param.getParent().name == "mainButtons")
		{
			var id = [(parseInt(param.name.charAt(6))), (parseInt(param.name.charAt(7))-1)];
			setButtonColor(id, color);
		}
		else if(param.getParent().name == "sideButtons")
		{
			var id = [parseInt(param.name.charAt(10)), 8];
			setButtonColor(id, color);
		}
	}

	// Pulsing
	if(param.getParent().getParent().name == "pulsing")
	{
		// if pulsing just got turned of send pull brightness color again
		if (!param.get()){
			var color = param.get();

			if(param.name == "logo")
			{
				var id = [0, 8];
				setButtonColor(id, color);
			}
			else if(param.getParent().name == "topButtons")
			{
				var id = [0, (parseInt(param.name.charAt(9))-1)];
				setButtonColor(id, color);
			}
			else if(param.getParent().name == "mainButtons")
			{
				var id = [(parseInt(param.name.charAt(6))), (parseInt(param.name.charAt(7))-1)];
				setButtonColor(id, color);
			}
			else if(param.getParent().name == "sideButtons")
			{
				var id = [parseInt(param.name.charAt(10)), 8];
				setButtonColor(id, color);
			}
		}
	}
}


function noteOnEvent(channel, note, velocity)
{
	var button = getButtonForNote(note);
	if (!!button)
	{
		button.set((velocity==127));
	}
}


function noteOffEvent(channel, note, velocity)
{
	var button = getButtonForNote(note);
	if (!!button)
	{
		button.set(false);
	}
}


function ccEvent(channel, note, value)
{
	var fader = getFaderForNote(note);
	if (!!fader)
	{
		fader.set(value/127);
	}
}


function sysExEvent(data)
{
	script.log("Sysex Message received, "+data.length+" bytes :");
}