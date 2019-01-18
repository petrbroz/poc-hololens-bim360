using HoloToolkit.Unity.Collections;
using HoloToolkit.UX.Dialog;
using HoloToolkit.UX.Progress;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

public class SceneListLoader : MonoBehaviour {
    [Tooltip("Game object storing the application config.")]
    public GameObject appConfig;
    [Tooltip("Button prefab for each scene.")]
    public GameObject buttonPrefab;
    [Tooltip("Game object to place scene geometry into.")]
    public GameObject sceneTarget;
    [Tooltip("Game object to place issue pushpins into.")]
    public GameObject issueTarget;
    [Tooltip("Error dialog prefab.")]
    public GameObject dialogPrefab;

    private ApplicationConfig _config;

    void Start () {
        _config = appConfig.GetComponent<ApplicationConfig>();
        
        ProgressIndicator.Instance.Open("Loading scenes...");
        StartCoroutine(LoadScenes());
    }

    IEnumerator LoadScenes()
    {
        using (UnityWebRequest req = UnityWebRequest.Get(string.Format("{0}/api/scene", _config.demoServerURL)))
        {
            yield return req.SendWebRequest();
            if (req.isNetworkError || req.isHttpError)
            {
                Debug.LogError(req.downloadHandler.text);
                Dialog dialog = Dialog.Open(dialogPrefab.gameObject, DialogButtonType.OK, "Scenes List Loading Error", req.downloadHandler.text);
            }
            else
            {
                ProgressIndicator.Instance.SetMessage("Parsing scenes...");

                string json = "{ \"scenes\": " + req.downloadHandler.text + " }";
                SceneResult result = JsonUtility.FromJson<SceneResult>(json);
                foreach (var scene in result.scenes)
                {
                    GameObject clone = Instantiate(buttonPrefab, transform);
                    var textMesh = clone.GetComponentInChildren<TextMesh>();
                    textMesh.text = scene;
                    var selectHandler = clone.AddComponent<SceneSelectHandler>();
                    selectHandler.url = _config.demoServerURL;
                    selectHandler.target = sceneTarget;
                    selectHandler.scene = scene;
                    selectHandler.dialogPrefab = dialogPrefab;
                }
                GetComponent<ObjectCollection>().UpdateCollection();

            }
            ProgressIndicator.Instance.Close();
        }
    }

    [System.Serializable]
    public class SceneResult
    {
        public string[] scenes;
    }
}