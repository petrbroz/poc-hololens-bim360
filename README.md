# poc-hololens-bim360

Sample application showing how to view and manipulate BIM 360 content from a HoloLens device
using [AR/VR Toolkit](http://forgetoolkit.com), [Mixed Reality Toolkit](https://github.com/Microsoft/MixedRealityToolkit-Unity),
and [Forge/BIM360 APIs](https://forge.autodesk.com/en/docs/bim360/v1).

## Development

### Prerequisites

- Unity 2018.2.17f1 with UWP Build Support (IL2CPP) component
    - older versions might work, too, but have not been tested
- Node.js v8.0 or newer
- Visual Studio 2017

### Bootstrap

#### Server Side

- install Node.js dependencies: `npm install`
- if you don't have one, create a Forge application with access to a BIM360 project ([tutorial](https://forge.autodesk.com/en/docs/bim360/v1/tutorials/getting-started/manage-access-to-docs))
- obtain a URN of one of your documents (to a specific version) in the BIM 360 project ([tutorial](https://forge.autodesk.com/en/docs/bim360/v1/tutorials/documen-management/download-document/#step-4-find-the-storage-object-id-for-the-file))
- obtain an ID of the issue container in the BIM 360 project ([tutorial](https://forge.autodesk.com/en/docs/bim360/v1/tutorials/issues/retrieve-container-id))
- generate a couple of AR/VR toolkit scenes for the URN ([tutorial](http://forgetoolkit.com/#/tutorial?id=step-2-set-up-a-scene))

The server requires several env. variables:
- `FORGE_CLIENT_ID` - client ID of your Forge application
- `FORGE_CLIENT_SECRET` - client secret of your Forge application
- `FORGE_API_HOST` - base URL for all requests to Forge; use https://developer.api.autodesk.com
- `REDIRECT_URL` - callback URL for the 3-legged auth workflow; use http://localhost:3000/api/auth/3-legged/callback when running locally
- `BIM360_MODEL_URN` - URN of one of your models stored in BIM360 Docs
- `BIM360_CONTAINER_ID` - BIM360 issues container ID
- `TOOLKIT_API_HOST` - base URL for all requests to AR/VR toolkit; use https://developer-api-beta.autodesk.io

If you're using Visual Studio Code, here's an example configuration you can use in _.vscode/launch.json_:
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "program": "${workspaceFolder}/index.js",
            "env": {
                "FORGE_CLIENT_ID": "<your client id>",
                "FORGE_CLIENT_SECRET": "<your client secret>",
                "FORGE_API_HOST": "https://developer.api.autodesk.com",
                "REDIRECT_URL": "http://localhost:3000/api/auth/3-legged/callback",
                "BIM360_MODEL_URN": "<your model urn>",
                "BIM360_CONTAINER_ID": "<your container id>",
                "TOOLKIT_API_HOST": "https://developer-api-beta.autodesk.io"
            }
        }
    ]
}
```

#### Client Side

The Unity application requires one small change as well. In the _Hierarchy_ window, find and select
a game object called _Scene List_. Then, find a component called _Scene List Loader_ in the _Inspector_
window, and set its _Url_ parameter to a URL of the Node.js server that will be accessible
from the HoloLens device. For example, if the IP address of the machine where you're running the Node.js
server is 192.168.0.123, set the parameter to _http://192.168.0.123:3000_.

### Running

With everything setup, try the following:
- start the server and open its URL in the browser
- use the _Login_ link in the sidebar to log in with your Autodesk ID
- the server will store the 3-legged auth token in memory; you should also see it in the _3-legged_ textbox in the sidebar
- the sidebar should now include a list of your AR/VR toolkit scenes, and potentially BIM 360 issues as well

While the server is running, open the Unity project in _unity/BIM360\_HoloLens\_Demo_ and follow these steps:
- go to _Mixed Reality Toolkit_ > _Configure_, click _Apply Mixed Reality Project Settings_, and apply the predefined options
- go to _Mixed Reality Toolkit_ > _Configure_, click _Apply UWP Capability Settings_,
and enable _Microphone_, _Webcam_, _Spatial Perception_, and _Internet Client_
- go to _Edit_ > _Project Settings_ > _Player_, and in the _Other Settings_ section, make sure the _Scripting Runtime Version_
is _.NET 4.x Equivalent_, and the _Scripting Backend_ is _IL2CPP_
- go to _Mixed Reality Toolkit_ menu, and click _Build Window_
- in the build window:
    - click _Build Unity Project_; this will create a Visual Studio 2017 project in _UWP_ subfolder
    - click _Open in Visual Studio_ to open the generated solution
- configure the UWP solution for deployment to HoloLens following this tutorial: https://docs.microsoft.com/en-us/windows/mixed-reality/using-visual-studio#deploying-an-app-over-wi-fi-hololens
- build and deploy the Unity application to your HoloLens device