using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using HoloToolkit.Unity.Buttons;
using UnityEngine.Networking;
using Autodesk.Forge.ARKit;
using HoloToolkit.Unity.UX;
using HoloToolkit.UX.Progress;
using HoloToolkit.UX.Dialog;

public class SceneSelectHandler : MonoBehaviour {
    [Tooltip("Demo server URL.")]
    public string url;
    [Tooltip("Scene ID.")]
    public string scene;
    [Tooltip("Game object to be populated with the scene content.")]
    public GameObject target;
    [Tooltip("Error dialog prefab.")]
    public GameObject dialogPrefab;

	void Start () {
        CompoundButton button = this.GetComponent<CompoundButton>();
        button.OnButtonClicked += OnButtonClicked;
    }

    private void OnButtonClicked(GameObject obj)
    {
        ProgressIndicator.Instance.Open("Loading scene...");
        StartCoroutine(GetScene());
    }

    IEnumerator GetScene()
    {
        using (UnityWebRequest req = UnityWebRequest.Get(string.Format("{0}/api/scene/{1}", url, scene)))
        {
            yield return req.SendWebRequest();

            if (req.isNetworkError || req.isHttpError)
            {
                Debug.LogError(req.error);
                Dialog dialog = Dialog.Open(dialogPrefab.gameObject, DialogButtonType.OK, "Scene Loading Error", req.error);
                ProgressIndicator.Instance.Close();
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
                loader.ProcessedNodes.AddListener(new UnityEngine.Events.UnityAction<float>(OnProcessingNodes));
                loader.ProcessingNodesCompleted.AddListener(new UnityEngine.Events.UnityAction<int>(OnProcessingNodesCompleted));
            }
        }
    }

    private void OnProcessingNodes(float progress)
    {
        ProgressIndicator.Instance.SetProgress(progress);
    }

    private void OnProcessingNodesCompleted(int i)
    {
        ProgressIndicator.Instance.Close();
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