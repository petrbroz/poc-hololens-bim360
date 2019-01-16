using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using HoloToolkit.Unity.Buttons;
using UnityEngine.Networking;
using Autodesk.Forge.ARKit;
using HoloToolkit.Unity.UX;

public class SceneSelectHandler : MonoBehaviour {
    public string url;
    public string scene;
    public GameObject target;

    private string _oldText;

	void Start () {
        CompoundButton button = this.GetComponent<CompoundButton>();
        button.OnButtonClicked += OnButtonClicked;
    }

    private void OnButtonClicked(GameObject obj)
    {
        StartCoroutine(GetScene());
    }

    IEnumerator GetScene()
    {
        _oldText = GetComponentInChildren<TextMesh>().text;
        GetComponentInChildren<TextMesh>().text = "Loading ...";
        using (UnityWebRequest req = UnityWebRequest.Get(string.Format("{0}/api/scene/{1}", url, scene)))
        {
            yield return req.SendWebRequest();

            if (req.isNetworkError || req.isHttpError)
            {
                Debug.LogError(req.error);
            }
            else
            {
                string json = req.downloadHandler.text;
                SceneInfo sceneInfo = SceneInfo.CreateFromJSON(json);
                foreach (Transform transform in target.transform)
                {
                    Destroy(transform.gameObject);
                }
                Destroy(target.GetComponent<ForgeLoader>());
                ForgeLoader loader = ForgeLoader.AddLoaderToGameObject(target, sceneInfo.prj.urn, scene, sceneInfo.access_token, false, true, true);
                loader.ProcessingNodesCompleted.AddListener(new UnityEngine.Events.UnityAction<int>(OnProcessingNodesCompleted));
            }
        }
    }

    private void OnProcessingNodesCompleted(int i)
    {
        GetComponentInChildren<TextMesh>().text = _oldText;
    }

    [System.Serializable]
    public class SceneInfo
    {
        public ProjectInfo prj;
        public int[] list;
        public string access_token;

        public static SceneInfo CreateFromJSON(string json)
        {
            return JsonUtility.FromJson<SceneInfo>(json);
        }

        [System.Serializable]
        public class ProjectInfo
        {
            public string urn;
            public string project_id;
        }
    }
}