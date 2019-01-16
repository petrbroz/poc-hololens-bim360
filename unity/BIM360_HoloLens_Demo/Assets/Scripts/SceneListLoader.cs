using HoloToolkit.Unity.Collections;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

public class SceneListLoader : MonoBehaviour {
    public string url; // Base URL for getting the list of all AR/VR toolkit scenes as well as individual scene info
    public GameObject buttonPrefab; // Button prefab for each scene
    public GameObject targetObject; // Game object to place scene geometry into

    // Use this for initialization
    void Start () {
        StartCoroutine(LoadScenes());
    }

    IEnumerator LoadScenes()
    {
        using (UnityWebRequest req = UnityWebRequest.Get(string.Format("{0}/api/scene", url)))
        {
            yield return req.SendWebRequest();
            if (req.isNetworkError || req.isHttpError)
            {
                Debug.LogError(req.error);
            }
            else
            {
                string json = "{ \"scenes\": " + req.downloadHandler.text + " }";
                SceneResult result = JsonUtility.FromJson<SceneResult>(json);
                foreach (var scene in result.scenes)
                {
                    GameObject clone = Instantiate(buttonPrefab, transform);
                    var textMesh = clone.GetComponentInChildren<TextMesh>();
                    textMesh.text = scene;
                    var selectHandler = clone.AddComponent<SceneSelectHandler>();
                    selectHandler.url = url;
                    selectHandler.target = targetObject;
                    selectHandler.scene = scene;
                }
                GetComponent<ObjectCollection>().UpdateCollection();
            }
        }
    }

    [System.Serializable]
    public class SceneResult
    {
        public string[] scenes;
    }
}