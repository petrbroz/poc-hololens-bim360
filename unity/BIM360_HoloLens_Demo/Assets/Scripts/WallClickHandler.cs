using HoloToolkit.Unity.InputModule;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class WallClickHandler : MonoBehaviour, IInputClickHandler {
    public GameObject issuePopup; // Issue popup game object (singleton)
    public GameObject cursor; // HoloLens cursor for popup positioning

    // Use this for initialization
    void Start () {
		
	}

	// Update is called once per frame
	void Update () {
		
	}

    public void OnInputClicked(InputClickedEventData eventData)
    {
        eventData.Use(); // Mark the event as used, so it doesn't fall through to other handlers.
        issuePopup.transform.SetPositionAndRotation(cursor.transform.position, Quaternion.identity);
        issuePopup.SetActive(true);
    }
}
