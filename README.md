# poc-hololens-bim360

Sample application showing how to view and manipulate BIM 360 content from a HoloLens device
using [AR/VR Toolkit](http://forgetoolkit.com), [Mixed Reality Toolkit](https://github.com/Microsoft/MixedRealityToolkit-Unity),
and [Forge/BIM360 APIs](https://forge.autodesk.com/en/docs/bim360/v1).

[![Demo](https://img.youtube.com/vi/h5YwP8nADn0/0.jpg)](https://www.youtube.com/watch?v=h5YwP8nADn0)

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
- obtain a lineage ID and a version URN of one of your documents in the BIM 360 project ([tutorial](https://forge.autodesk.com/en/docs/bim360/v1/tutorials/documen-management/download-document/#step-4-find-the-storage-object-id-for-the-file))
- obtain an ID of the issue container in the BIM 360 project ([tutorial](https://forge.autodesk.com/en/docs/bim360/v1/tutorials/issues/retrieve-container-id))
- generate a couple of AR/VR toolkit scenes for the document version URN ([tutorial](http://forgetoolkit.com/#/tutorial?id=step-2-set-up-a-scene))

The server requires several env. variables:
- `SERVER_URL` - URL on which this server can be accessed by other devices, for example, http://192.168.0.123:3000
- `FORGE_CLIENT_ID` - client ID of your Forge application
- `FORGE_CLIENT_SECRET` - client secret of your Forge application
- `FORGE_API_HOST` - base URL for all requests to Forge; use https://developer.api.autodesk.com
- `REDIRECT_URL` - callback URL for the 3-legged auth workflow, for example, http://192.168.0.123:3000/api/auth/3-legged/callback
- `BIM360_CONTAINER_ID` - BIM360 issues container ID
- `BIM360_DOCUMENT_LINEAGE_ID` - ID of a specific BIM360 document lineage; will be used for listing/creating issues
- `BIM360_DOCUMENT_VERSION_URN` - URN of a specific BIM360 document version; will be used for viewing and for AR/VR toolkit scenes
- `BIM360_DOCUMENT_SHEET_GUID` - GUID of a specific sheet; will be used for creating issues
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
                "SERVER_URL": "http://<your ip address>:3000",
                "FORGE_CLIENT_ID": "<your client id>",
                "FORGE_CLIENT_SECRET": "<your client secret>",
                "REDIRECT_URL": "http://<your ip address>:3000/api/auth/3-legged/callback",
                "FORGE_API_HOST": "https://developer.api.autodesk.com",
                "TOOLKIT_API_HOST": "https://developer-api-beta.autodesk.io",
                "BIM360_CONTAINER_ID": "<your BIM360 issue container id>",
                "BIM360_DOCUMENT_LINEAGE_ID": "<your BIM360 document lineage ID, without base64-encoding>",
                "BIM360_DOCUMENT_VERSION_URN": "<your BIM360 document version URN, base64-encoded>",
                "BIM360_DOCUMENT_SHEET_GUID": "<your BIM360 document sheet GUID>"
            }
        }
    ]
}
```

#### Client Side

To setup the Unity project for development and building:
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

## Running

- start the server and open its URL in the browser
- use the _Login_ link in the sidebar to log in with your Autodesk ID
    - the sidebar should now include a list of BIM360 documents and issues, AR/VR scenes, and a QR code
    - the QR code encodes a URL providing all config parameters such as server URL or access token
- start the Unity application on your HoloLens device, and look at the QR code with the headset on
- after scanning the QR code, the Unity application is configured and should greet you with a list of scenes
- airtap on one of the scenes to load the geometry as well as any BIM360 issues associated with it