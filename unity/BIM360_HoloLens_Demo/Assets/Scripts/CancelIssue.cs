using HoloToolkit.Unity.Buttons;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CancelIssue : MonoBehaviour {
    [Tooltip("Popup game object to hide after successfull issue submission.")]
    public GameObject issuePopup;

    void Start()
    {
        GetComponent<CompoundButton>().OnButtonClicked += OnButtonClicked;
    }

    private void OnButtonClicked(GameObject obj)
    {
        issuePopup.SetActive(false);
    }
}