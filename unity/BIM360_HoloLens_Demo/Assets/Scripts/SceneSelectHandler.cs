using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using HoloToolkit.Unity.Buttons;
using UnityEngine.Networking;
using Autodesk.Forge.ARKit;
using HoloToolkit.Unity.UX;
using HoloToolkit.UX.Progress;
using HoloToolkit.UX.Dialog;
using HoloToolkit.UX.ToolTips;
using UnityEngine.UI;

public class SceneSelectHandler : MonoBehaviour {
    [Tooltip("Scene ID.")]
    public string scene;
    [Tooltip("Game object to be populated with the scene content.")]
    public GameObject target;
    [Tooltip("Error dialog prefab.")]
    public GameObject dialogPrefab;
    [Tooltip("Game object to be populated with issue pushpins.")]
    public GameObject issuesTarget;
    [Tooltip("Existing issue puship prefab.")]
    public GameObject issuePrefab;

    public ApplicationConfig appConfig;

    void Start () {
        CompoundButton button = this.GetComponent<CompoundButton>();
        button.OnButtonClicked += OnButtonClicked;
    }

    private void OnButtonClicked(GameObject obj)
    {
        ProgressIndicator.Instance.Open("Loading scene...");
        StartCoroutine(GetScene());
        StartCoroutine(GetIssues());
    }

    IEnumerator GetScene()
    {
        string url = string.Format("{0}/v2/api/docs/{1}/scenes/{2}", appConfig.demoServerURL, appConfig.modelID, scene);
        using (UnityWebRequest req = UnityWebRequest.Get(url))
        {
            req.SetRequestHeader("Authorization", "Bearer " + appConfig.accessToken);
            yield return req.SendWebRequest();

            if (req.isNetworkError || req.isHttpError)
            {
                Debug.LogError(req.error);
                Dialog.Open(dialogPrefab.gameObject, DialogButtonType.OK, "Scene Loading Error", req.error);
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
                ForgeLoader loader = ForgeLoader.AddLoaderToGameObject(target, sceneInfo.prj.urn, scene, appConfig.accessToken, false, true, true);
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

        /*
         * PETR's HACK:
         *
         * The AR/VR toolkit does not seem to support "global offset"
         * that can be defined in the metadata of an SVF file.
         * This information is important if we want to be able to map
         * positions (e.g., of BIM360 issues) in Unity back to the original
         * coord. system.
         *
         * In this prototype, we will assume a single document urn
         * which is known to have the global offset (1.5, 48.6, -10.4).
         */
        foreach (Transform transform in target.transform)
        {
            transform.localPosition = new Vector3(1.5f, 48.6f, -10.4f);
            transform.localEulerAngles = Vector3.zero;
            transform.localScale = Vector3.one;
        }
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

    IEnumerator GetIssues()
    {
        string url = string.Format("{0}/v2/api/docs/{1}/issues", appConfig.demoServerURL, appConfig.modelID);
        using (UnityWebRequest req = UnityWebRequest.Get(url))
        {
            req.SetRequestHeader("Authorization", "Bearer " + appConfig.accessToken);
            yield return req.SendWebRequest();

            if (req.isNetworkError || req.isHttpError)
            {
                Debug.LogError(req.error);
            }
            else
            {
                // Clear all previous issue pushpins
                foreach (Transform transform in issuesTarget.transform)
                {
                    Destroy(transform.gameObject);
                }

                // Parse new pushpins and instantiate them in the scene
                string json = req.downloadHandler.text;
                Issues issues = Issues.CreateFromJSON(json);
                foreach (var issue in issues.issues)
                {
                    GameObject clone = Instantiate(issuePrefab);
                    clone.transform.parent = issuesTarget.transform;
                    clone.transform.localPosition = new Vector3(issue.pushpin_location.x, issue.pushpin_location.y, issue.pushpin_location.z);
                    clone.transform.localScale = new Vector3(5f, 5f, 5f);
                    clone.transform.localRotation = Quaternion.Euler(90f, 0f, 0f);
                    clone.GetComponentInChildren<Text>().text = issue.title;
                    //Debug.Log("Issue: " + issue.title);
                }
            }
        }
    }

    [System.Serializable]
    public class Issues
    {
        [System.Serializable]
        public class Issue
        {
            [System.Serializable]
            public class PushpinLocation
            {
                public float x;
                public float y;
                public float z;
            }

            public string title;
            public string description;
            public string status;
            public string pushpin_type;
            public string pushpin_object_id;
            public PushpinLocation pushpin_location;
        }

        public Issue[] issues;

        public static Issues CreateFromJSON(string json)
        {
            return JsonUtility.FromJson<Issues>("{\"issues\":" + json + "}");
        }
    }
}