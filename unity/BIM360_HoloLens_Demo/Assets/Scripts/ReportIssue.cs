﻿using HoloToolkit.Unity.Buttons;
using HoloToolkit.UX.Dialog;
using HoloToolkit.UX.Progress;
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
    [Tooltip("Error dialog prefab.")]
    public GameObject dialogPrefab;
    [Tooltip("Popup game object to hide after successfull issue submission.")]
    public GameObject issuePopup;
    [Tooltip("Position to use for the reported issue.")]
    public Transform targetTransform;
    [Tooltip("Scene transform for obtaining the issue position.")]
    public Transform sceneTransform;

    private ApplicationConfig _config;

    void Start () {
        _config = appConfig.GetComponent<ApplicationConfig>();
        GetComponent<CompoundButton>().OnButtonClicked += OnButtonClicked;
	}

    private void OnButtonClicked(GameObject obj)
    {
        ProgressIndicator.Instance.Open("Submitting issue...");
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
        //data.AddField("object_id", "");

        // Temporarily move the issue marker to the Scene object
        // so that we can obtain the correct issue location in the Scene coord. system
        Transform oldParent = targetTransform.parent;
        targetTransform.parent = sceneTransform;
        data.AddField("x", targetTransform.localPosition.x.ToString());
        data.AddField("y", targetTransform.localPosition.y.ToString());
        data.AddField("z", targetTransform.localPosition.z.ToString());
        targetTransform.parent = oldParent;

        string url = string.Format("{0}/v2/api/docs/{1}/issues", _config.demoServerURL, _config.modelID);
        using (UnityWebRequest req = UnityWebRequest.Post(url, data))
        {
            req.SetRequestHeader("Authorization", "Bearer " + _config.accessToken);
            yield return req.SendWebRequest();
            ProgressIndicator.Instance.Close();
            if (req.isNetworkError || req.isHttpError)
            {
                Debug.LogError(req.error);
                Dialog.Open(dialogPrefab.gameObject, DialogButtonType.OK, "Issue Submission Error", req.error);
            }
            else
            {
                issuePopup.SetActive(false);
                Dialog.Open(dialogPrefab.gameObject, DialogButtonType.OK, "Issue Submission Success", "The issue has been successfully submitted.");
            }
        }
    }
}