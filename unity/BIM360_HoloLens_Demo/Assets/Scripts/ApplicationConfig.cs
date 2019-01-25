using UnityEngine;

#if WINDOWS_UWP
using System;
using Windows.Storage;
#endif

public class ApplicationConfig : MonoBehaviour {
    [Tooltip("Demo server URL.")]
    public string demoServerURL;

    public delegate void ReadyAction();
    public static event ReadyAction OnConfigReady;

    public void Start()
    {
        ParseConfiguration();
#if WINDOWS_UWP
        Debug.Log("Trying to activate QR code scanning for 30 seconds");
        try
        {
            MediaFrameQrProcessing.Wrappers.ZXingQrCodeScanner.ScanFirstCameraForQrCode(
                result =>
                {
                    Debug.Log("Result of QR code scanning: " + (result ?? "<none>"));
                    //UnityEngine.WSA.Application.InvokeOnAppThread(() => { this.textMesh.text = result ?? "not found"; },  false);
                },
                TimeSpan.FromSeconds(30)
            );
        }
        catch (Exception e)
        {
            Debug.Log("Error when activating QR code scanning: " + e.ToString());
        }
#endif
    }

#if WINDOWS_UWP
    async void ParseConfiguration()
    {
        try
        {
            StorageFolder folder = ApplicationData.Current.LocalFolder;
            Debug.Log("Local folder path: " + folder.Path);
            StorageFile file = await folder.GetFileAsync("config.json");
            string json = await FileIO.ReadTextAsync(file);
            Debug.Log("Config file found: " + json);
            Configuration config = Configuration.CreateFromJSON(json);
            demoServerURL = config.host;
        }
        catch (Exception e)
        {
            Debug.Log("Config file not found.");
        }
        finally
        {
            OnConfigReady?.Invoke();
        }
    }
#else
    void ParseConfiguration()
    {
        OnConfigReady?.Invoke();
    }
#endif

    [System.Serializable]
    public class Configuration
    {
        public string host;

        public static Configuration CreateFromJSON(string json)
        {
            return JsonUtility.FromJson<Configuration>(json);
        }
    }
}