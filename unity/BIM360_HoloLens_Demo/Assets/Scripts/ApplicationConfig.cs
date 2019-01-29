using HoloToolkit.UX.Dialog;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using HoloToolkit.UX.Progress;
using HoloToolkit.Unity;

#if WINDOWS_UWP
using System;
using Windows.Storage;
#endif

public class ApplicationConfig : MonoBehaviour {
    [Tooltip("Demo server URL.")]
    public string demoServerURL;
    [Tooltip("BIM360 model ID.")]
    public string modelID;
    [Tooltip("3-legged access token.")]
    public string accessToken;

    public delegate void ReadyAction();
    public static event ReadyAction OnConfigReady;

    public void Start()
    {
        ProgressIndicator.Instance.Open("Loading application config...");

#if WINDOWS_UWP
        // On UWP platform, try and scan for QR code for 60 seconds.
        // If a QR code is found, make a request to its encoded URL
        // to see if it contains configuration JSON.
        TextToSpeech textToSpeech = GetComponent<TextToSpeech>();
        textToSpeech.StartSpeaking("Please scan a QR code with your session configuration.");
        ProgressIndicator.Instance.SetMessage("Scanning for QR code with configuration URL...");
        Debug.Log("Activating QR code scanning for 60 seconds");
        try
        {
            MediaFrameQrProcessing.Wrappers.ZXingQrCodeScanner.ScanFirstCameraForQrCode(
                result =>
                {
                    Debug.Log("Result of QR code scanning: " + (result ?? "<none>"));
                    UnityEngine.WSA.Application.InvokeOnAppThread(() => { StartCoroutine(ParseConfigurationFromURL(result)); }, false);
                },
                TimeSpan.FromSeconds(60)
            );
        }
        catch (Exception e)
        {
            ProgressIndicator.Instance.Close();
            Debug.Log("Error when activating QR code scanning: " + e.ToString());
        }
#else
        // On non-UWP platforms, immediately notify other components
        // that the configuration is ready.
        OnConfigReady?.Invoke();
#endif
    }

    IEnumerator ParseConfigurationFromURL(string url)
    {
        ProgressIndicator.Instance.SetMessage("Loading application configuration...");
        using (UnityWebRequest req = UnityWebRequest.Get(url))
        {
            yield return req.SendWebRequest();
            if (req.isNetworkError || req.isHttpError)
            {
                ProgressIndicator.Instance.Close();
                Debug.LogError(req.downloadHandler.text);
            }
            else
            {
                Debug.Log("Loaded configuration: " + req.downloadHandler.text);
                Configuration config = Configuration.CreateFromJSON(req.downloadHandler.text);
                demoServerURL = config.host;
                modelID = config.model;
                accessToken = config.access_token;
                OnConfigReady?.Invoke();
            }
        }
    }

#if WINDOWS_UWP
    async void ParseConfigurationFromFile(string filename)
    {
        try
        {
            StorageFolder folder = ApplicationData.Current.LocalFolder;
            Debug.Log("Local folder path: " + folder.Path);
            StorageFile file = await folder.GetFileAsync(filename);
            string json = await FileIO.ReadTextAsync(file);
            Debug.Log("Config file found: " + json);
            Configuration config = Configuration.CreateFromJSON(json);
            demoServerURL = config.host;
        }
        catch (Exception)
        {
            Debug.Log("Config file not found.");
        }
        finally
        {
            OnConfigReady?.Invoke();
        }
    }
#endif

    [System.Serializable]
    public class Configuration
    {
        public string id; // Session ID
        public string host; // Demo server URL
        public string model; // BIM360 model (lineage) ID
        public string access_token; // 3-legged access token

        public static Configuration CreateFromJSON(string json)
        {
            return JsonUtility.FromJson<Configuration>(json);
        }
    }
}