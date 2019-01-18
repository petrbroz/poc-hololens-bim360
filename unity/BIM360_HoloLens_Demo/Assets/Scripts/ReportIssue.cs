using HoloToolkit.Unity.Buttons;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

public class ReportIssue : MonoBehaviour {
    [Tooltip("Game object storing the application config.")]
    public GameObject appConfig;
    [Tooltip("Input text for issue title.")]
    public GameObject issueTitleInput;
    [Tooltip("Input text for issue description.")]
    public GameObject issueDescriptionInput;
    private int counter = 0;

    private ApplicationConfig _config;

    void Start () {
        _config = appConfig.GetComponent<ApplicationConfig>();
        GetComponent<CompoundButton>().OnButtonClicked += OnButtonClicked;
	}

    private void OnButtonClicked(GameObject obj)
    {
        StartCoroutine(SubmitIssue());
    }

    IEnumerator SubmitIssue()
    {
        WWWForm data = new WWWForm();
        data.AddField("title", issueTitleInput.GetComponent<Text>().text);
        data.AddField("description", issueDescriptionInput.GetComponent<Text>().text);
        data.AddField("status", "open");
        data.AddField("issue_type", "1937a13f-9579-4cbf-a631-198ac0958d44"); // TODO: load issue types from server
        data.AddField("issue_subtype", "680b2e01-b05d-4e6d-a2a8-a4032e007857"); // TODO: load issue subtypes from server
        using (UnityWebRequest req = UnityWebRequest.Post(string.Format("{0}/api/issue", _config.demoServerURL), data))
        {
            yield return req.SendWebRequest();
            if (req.isNetworkError || req.isHttpError)
            {
                Debug.LogError(req.error);
            }
            else
            {
                // TODO
            }
        }
    }
}