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
    [Tooltip("Issue tooltip prefab.")]
    public GameObject issuePrefab;

    private ApplicationConfig _config;

    void Start() {
        _config = appConfig.GetComponent<ApplicationConfig>();
        ApplicationConfig.OnConfigReady += OnConfigReady;
    }

    private void OnConfigReady()
    {
        ProgressIndicator.Instance.SetMessage("Loading scenes...");
        StartCoroutine(LoadScenes());
    }

    IEnumerator LoadScenes()
    {
        string url = string.Format("{0}/v2/api/docs/{1}/scenes", _config.demoServerURL, _config.modelID);
        using (UnityWebRequest req = UnityWebRequest.Get(url))
        {
            req.SetRequestHeader("Authorization", "Bearer " + _config.accessToken);
            yield return req.SendWebRequest();

            if (req.isNetworkError || req.isHttpError)
            {
                Debug.LogError(req.downloadHandler.text);
                Dialog.Open(dialogPrefab.gameObject, DialogButtonType.OK, "Scenes List Loading Error", req.downloadHandler.text);
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
                    selectHandler.appConfig = _config;
                    selectHandler.target = sceneTarget;
                    selectHandler.scene = scene;
                    selectHandler.dialogPrefab = dialogPrefab;
                    selectHandler.issuesTarget = issueTarget;
                    selectHandler.issuePrefab = issuePrefab;
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