using HoloToolkit.Unity.Buttons;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

public class ReportIssue : MonoBehaviour {
    public string url;
    public GameObject issueTitleInput;
    public GameObject issueDescriptionInput;
    private int counter = 0;

    void Start () {
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
        using (UnityWebRequest req = UnityWebRequest.Post(string.Format("{0}/api/issue", url), data))
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