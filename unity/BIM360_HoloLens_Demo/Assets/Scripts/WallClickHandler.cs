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
        Debug.LogFormat("OnInputClicked\r\nSource: {0}  SourceId: {1}  InteractionPressKind: {2}  TapCount: {3}", eventData.InputSource, eventData.SourceId, eventData.PressType, eventData.TapCount);
        eventData.Use(); // Mark the event as used, so it doesn't fall through to other handlers.

        issuePopup.transform.SetPositionAndRotation(cursor.transform.position, Quaternion.identity);
        issuePopup.SetActive(true);

        //Vector3 pointerPosition;
        //if (eventData.InputSource.TryGetPointerPosition(eventData.SourceId, out pointerPosition))
        //if (eventData.InputSource.TryGetGripPosition(eventData.SourceId, out pointerPosition))
        //{
        //    GameObject clone = Instantiate(issuePopupPrefab/*, transform*/);
        //    clone.transform.SetPositionAndRotation(pointerPosition, Quaternion.identity);
        //}

        //var textMesh = clone.GetComponentInChildren<TextMesh>();
        //textMesh.text = scene;
        //var selectHandler = clone.AddComponent<SceneSelectHandler>();
        //selectHandler.url = url;
        //selectHandler.target = targetObject;
        //selectHandler.scene = scene;
    }
}
